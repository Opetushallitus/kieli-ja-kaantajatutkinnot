package fi.oph.akr.util.prod;

import static fi.oph.akr.util.prod.RowUtils.bool;
import static fi.oph.akr.util.prod.RowUtils.date;
import static fi.oph.akr.util.prod.RowUtils.toStringSqlQuoted;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import liquibase.util.csv.CSVReader;
import lombok.NonNull;
import org.springframework.data.util.Pair;

public class ProdImport {

  public static void main(String[] args) throws IOException {
    if (args.length != 5) {
      System.out.println(
        "Usage: java ProdImport.java translators.csv translatorLanguages.csv koodisto_kielet.json koodisto_maat_json outfile.txt"
      );
      System.exit(1);
    }
    final String translatorsPath = args[0];
    final String languagesPath = args[1];
    final String koodistoLangsPath = args[2];
    final String koodistoCountriesPath = args[3];
    final String outFile = args[4];

    final Map<String, String> koodistoLangsMap = readKoodistoLanguages(koodistoLangsPath);
    final Map<String, String> koodistoCountriesMap = readKoodistoCountries(koodistoCountriesPath);

    final List<TranslatorRow> translators = parseTranslators(translatorsPath);
    final Map<Integer, List<LanguageRow>> translatorLanguagesMap = parseTranslatorLanguages(languagesPath);

    final Set<Integer> idsOfKnownDuplicateEmails = getTranslatorIdsOfKnownDuplicateEmails(translators);
    final Set<Integer> idsOfKnownDuplicateSsns = getTranslatorIdsOfKnownDuplicateSsns(translators);
    final Set<Integer> knownEmptyRows = getTranslatorIdsOfKnownEmptyLanguageRows();
    final Set<Integer> translatorIdsWhichAreVirButEndDateIsReturned = getTranslatorIdsWhichAreVirButEndDateIsReturned();

    final List<Pair<TranslatorRow, List<LanguageRow>>> translatorsAndLanguages = translators
      .stream()
      .map(t -> {
        final List<LanguageRow> translatorLanguages = translatorLanguagesMap.getOrDefault(t.id(), new ArrayList<>());
        if (t.lastName().isBlank()) {
          System.out.println("Skipping empty translator id:" + t.id());
          return null;
        }
        if (translatorLanguages.isEmpty()) {
          System.out.println("Skipping translator with no languages: " + t.id());
          return null;
        }
        final List<LanguageRow> languages = translatorLanguages
          .stream()
          .filter(lang -> lang.shouldBeImported(koodistoLangsMap, knownEmptyRows))
          .flatMap(lang ->
            lang
              .splitRenewals(getTranslatorIdsHavingInvalidDates(), translatorIdsWhichAreVirButEndDateIsReturned)
              .stream()
          )
          .toList();
        return Pair.of(t, languages);
      })
      .filter(Objects::nonNull)
      .filter(p -> !p.getSecond().isEmpty())
      .toList();

    FileWriter fileWriter = new FileWriter(outFile);
    PrintWriter printWriter = new PrintWriter(fileWriter);
    printWriter.println(
      "TRUNCATE translator CASCADE;" +
      "TRUNCATE examination_date CASCADE;" +
      "TRUNCATE meeting_date CASCADE;" +
      "TRUNCATE email CASCADE;"
    );
    final Set<LocalDate> meetingDates = translatorsAndLanguages
      .stream()
      .flatMap(p -> p.getSecond().stream())
      .map(LanguageRow::resolveMeetingDate)
      .filter(Objects::nonNull)
      .collect(Collectors.toSet());
    meetingDates
      .stream()
      .sorted()
      .forEach(date -> {
        final String insertMeetingDateSql = "INSERT INTO meeting_date(date) VALUES ('%s');".formatted(date);
        printWriter.println(insertMeetingDateSql);
      });

    final Set<LocalDate> examinationDates = translatorsAndLanguages
      .stream()
      .flatMap(p -> p.getSecond().stream())
      .map(r -> r.resolveAutDate(getTranslatorIdsOfKnownAutMissingExamDate()))
      .filter(Objects::nonNull)
      .collect(Collectors.toSet());
    examinationDates
      .stream()
      .sorted()
      .forEach(date -> {
        final String insertMeetingDateSql = "INSERT INTO examination_date(date) VALUES ('%s');".formatted(date);
        printWriter.println(insertMeetingDateSql);
      });

    translatorsAndLanguages.forEach(pair -> {
      final TranslatorRow t = pair.getFirst();
      final List<LanguageRow> languages = pair.getSecond();

      final String insertTranslatorSql =
        (
          "WITH inserted_translator AS (INSERT INTO translator(identity_number, first_name, last_name, email, phone_number, street, town, postal_code, country, extra_information, is_assurance_given)" +
          " VALUES ('%s', '%s', '%s', %s, '%s', '%s', '%s', '%s', %s, '%s', %s)" +
          " RETURNING translator_id)"
        ).formatted(
            sanitizeSsn(idsOfKnownDuplicateSsns, t),
            t.resolveFirstName(),
            t.resolveLastName(),
            sanitizedEmail(idsOfKnownDuplicateEmails, t),
            t.resolvePhone(),
            t.resolveAddress(),
            t.resolveCity(getTranslatorCityFixes()),
            t.postalCode(),
            t.resolveCountry(getTranslatorIdsOfKnownFinnishAddressesButForeignCountry(), koodistoCountriesMap),
            t.resolveInfo(languages),
            t.resolveIsOathed()
          );
      final List<String> authorisationInserts = new ArrayList<>();
      IntStream
        .range(0, languages.size())
        .forEach(i -> {
          final LanguageRow lang = languages.get(i);
          final Optional<org.apache.commons.lang3.tuple.Pair<LocalDate, LocalDate>> beginAndEnd = lang.resolveStartAndEndDate(
            translatorIdsWhichAreVirButEndDateIsReturned
          );
          final String insertAuthorisationSql =
            (
              "inserted_authorisation%s AS (INSERT INTO authorisation (translator_id, basis, meeting_date_id, examination_date_id, from_lang, to_lang, permission_to_publish, diary_number, term_begin_date, term_end_date)" +
              " SELECT translator_id, '%s', %s, %s, '%s', '%s', %s, %s, %s, %s" +
              " FROM inserted_translator" +
              " RETURNING authorisation_id)"
            ).formatted(
                i,
                lang.resolveBasis(),
                lang.resolveMeetingDate() != null
                  ? "(SELECT meeting_date_id FROM meeting_date WHERE date='%s')".formatted(lang.resolveMeetingDate())
                  : "null",
                lang.resolveAutDate(getTranslatorIdsOfKnownAutMissingExamDate()) != null
                  ? "(SELECT examination_date_id FROM examination_date WHERE date='%s')".formatted(
                      lang.resolveAutDate(getTranslatorIdsOfKnownAutMissingExamDate())
                    )
                  : "null",
                lang.resolveFrom(koodistoLangsMap),
                lang.resolveTo(koodistoLangsMap),
                t.officialListPublishPermitted(),
                lang.resolveDiary(),
                toStringSqlQuoted(beginAndEnd.map(org.apache.commons.lang3.tuple.Pair::getLeft).orElse(null)),
                toStringSqlQuoted(beginAndEnd.map(org.apache.commons.lang3.tuple.Pair::getRight).orElse(null))
              );
          authorisationInserts.add(insertAuthorisationSql);
        });

      final String sql = "%s, %s SELECT 1;\n".formatted(insertTranslatorSql, String.join(",", authorisationInserts));
      printWriter.println(sql);
    });
    printWriter.close();
  }

  private static Set<Integer> getTranslatorIdsWhichAreVirButEndDateIsReturned() {
    return Set.of(4479);
  }

  private static Map<Integer, String> getTranslatorCityFixes() {
    return Map.of(588, "SALO");
  }

  private static Set<Integer> getTranslatorIdsOfKnownFinnishAddressesButForeignCountry() {
    return Set.of(506, 1422, 1975, 2114, 2717, 2753, 2845, 4055, 4465);
  }

  private static Set<Integer> getTranslatorIdsOfKnownEmptyLanguageRows() {
    return Set.of(4498, 4521, 4575);
  }

  private static Set<Integer> getTranslatorIdsHavingInvalidDates() {
    return Set.of();
  }

  private static Set<Integer> getTranslatorIdsOfKnownAutMissingExamDate() {
    return Set.of();
  }

  private static Set<Integer> getTranslatorIdsOfKnownDuplicateEmails(final List<TranslatorRow> translators) {
    final Set<Integer> known = Set.of(524, 527, 554, 555);

    final Set<String> knownDuplicateEmails = translators
      .stream()
      .filter(t -> known.contains(t.id()))
      .map(TranslatorRow::email)
      .filter(email -> !email.isBlank() && !email.equals("-"))
      .collect(Collectors.toSet());
    if (knownDuplicateEmails.size() != known.size() / 2) {
      throw new RuntimeException("Known duplicates are not duplicates anymore? From the known ids we find email addresses:" + knownDuplicateEmails);
    }

    final List<String> duplicates = translators
      .stream()
      .collect(Collectors.groupingBy(TranslatorRow::email))
      .entrySet()
      .stream()
      .filter(e -> e.getValue().size() > 1)
      .map(Map.Entry::getKey)
      .filter(email -> !email.isBlank() && !email.equals("-"))
      .toList();
    translators.forEach(t -> {
      if (duplicates.contains(t.email()) && !known.contains(t.id())) {
        throw new RuntimeException("Unknown duplicate email " + t.email() + " translator id " + t.id());
      }
    });
    return known;
  }

  private static Set<Integer> getTranslatorIdsOfKnownDuplicateSsns(final List<TranslatorRow> translators) {
    final Set<Integer> known = Set.of(); // Data is expected to be fixed now, no duplicates should exist.
    final List<String> duplicates = translators
      .stream()
      .collect(Collectors.groupingBy(TranslatorRow::ssn))
      .entrySet()
      .stream()
      .filter(e -> e.getValue().size() > 1)
      .map(Map.Entry::getKey)
      .filter(ssn -> !ssn.isBlank())
      .toList();
    translators.forEach(t -> {
      if (duplicates.contains(t.ssn()) && !known.contains(t.id())) {
        throw new RuntimeException("Unknown duplicate ssn " + t.ssn() + " translator id " + t.id());
      }
    });
    return known;
  }

  private static Object sanitizeSsn(final Set<Integer> ids, final TranslatorRow t) {
    if (ids.contains(t.id())) {
      System.out.println("FIXME ssn " + t.id());
      return "FIXME-" + t.id() + "-" + t.ssn();
    }
    return t.ssn();
  }

  private static Object sanitizedEmail(final Set<Integer> ids, final TranslatorRow t) {
    final String email = t.email();
    if (email.isBlank() || email.equals("-")) {
      return null;
    }
    if (ids.contains(t.id())) {
      return "'%s %s <%s>'".formatted(t.firstName(), t.lastName(), email);
    }
    return "'" + email + "'";
  }

  private static List<TranslatorRow> parseTranslators(final String translatorsPath) throws IOException {
    final List<String[]> translatorLines = readCSV(translatorsPath);
    final List<TranslatorRow> translators = new ArrayList<>();

    for (int i = 1; i < translatorLines.size(); i++) {
      final String[] translatorLine = translatorLines.get(i);
      final TranslatorRow t = TranslatorRow
        .builder()
        .id(Integer.parseInt(translatorLine[0]))
        .lastName(translatorLine[1])
        .lastNamePrevious(translatorLine[2])
        .firstName(translatorLine[3])
        .ssn(translatorLine[5])
        .address(translatorLine[8])
        .postalCode(translatorLine[9])
        .city(translatorLine[10])
        .country(translatorLine[11])
        .phoneHome(translatorLine[12])
        .phoneWork(translatorLine[13])
        .email(translatorLine[14])
        .education(translatorLine[16])
        .faculty(translatorLine[17])
        .title(translatorLine[18])
        .oathedStatus(bool(translatorLine[19]))
        .oathedDate(date(translatorLine[20]))
        .officialStatus(bool(translatorLine[21]))
        .officialDate(date(translatorLine[22]))
        .authorisationStatus(bool(translatorLine[23]))
        .authorisationDate(date(translatorLine[24]))
        .officialListPublishPermitted(bool(translatorLine[25]))
        .internetPublishBanned(bool(translatorLine[26]))
        .info(translatorLine[27])
        .build();
      translators.add(t);
    }
    return translators;
  }

  private static Map<Integer, List<LanguageRow>> parseTranslatorLanguages(final String languagesPath) {
    final List<String[]> languageLines = readCSV(languagesPath);
    final Map<Integer, List<LanguageRow>> translatorLanguagesMap = new HashMap<>();

    for (int i = 1; i < languageLines.size(); i++) {
      final String[] langsLine = languageLines.get(i);

      final LanguageRow lang = LanguageRow
        .builder()
        .translatorId(Integer.parseInt(langsLine[0]))
        .from(langsLine[1])
        .to(langsLine[2])
        .authorisationStatusDer(bool(langsLine[3]))
        .authorisationExamCertificateDate(date(langsLine[4]))
        .authorisationExamDate(date(langsLine[5]))
        .authorisationCertificateDate(date(langsLine[6]))
        .authorisationStatusDateEnd(date(langsLine[7]))
        .authorisationBasis(langsLine[8])
        .authorisationBasisDiary(langsLine[9])
        .authorisationRenewDiary(langsLine[10])
        .oathedStatusDer(bool(langsLine[11]))
        .oathedExamDate(date(langsLine[12]))
        .certificateDate(date(langsLine[13]))
        .statusDateEnd(langsLine[14])
        .officialStatusDer(bool(langsLine[15]))
        .officialExamDate(date(langsLine[16]))
        .officialCertificateDate(date(langsLine[17]))
        .officialStatusDateEnd(date(langsLine[18]))
        .specialStatus(bool(langsLine[19]))
        .languageInstituteStatus(bool(langsLine[20]))
        .correctionRequestStatus(bool(langsLine[21]))
        .authorisationRenewDate(date(langsLine[24]))
        .authorisationRenewEndDate(date(langsLine[25]))
        .build();

      final List<LanguageRow> translatorLangList = translatorLanguagesMap.getOrDefault(
        lang.translatorId(),
        new ArrayList<>()
      );
      translatorLangList.add(lang);
      translatorLanguagesMap.put(lang.translatorId(), translatorLangList);
    }
    return translatorLanguagesMap;
  }

  private static List<String[]> readCSV(final String path) {
    final List<String[]> lines = new ArrayList<>();
    try (
      final CSVReader csv = new CSVReader(
        new InputStreamReader(Files.newInputStream(Path.of(path))),
        ';',
        CSVReader.DEFAULT_QUOTE_CHARACTER
      )
    ) {
      // readNext will return null or throw exception when all is done
      while (true) {
        final String[] e = csv.readNext();
        if (e == null) {
          break;
        }
        lines.add(e);
      }
    } catch (final Exception e) {
      // pass
    }
    return lines;
  }

  private static Map<String, String> readKoodistoLanguages(final String koodistoLangsPath) {
    try (final InputStream is = Files.newInputStream(Path.of(koodistoLangsPath))) {
      final List<Lang> koodistoLanguages = deserializeJson(is);
      final HashMap<String, String> map = new HashMap<>();
      koodistoLanguages.forEach(lang -> {
        lang.metadata.forEach(meta -> {
          if (Objects.equals("FI", meta.kieli())) {
            map.put(meta.nimi().toLowerCase(), lang.koodiArvo);
          }
        });
      });
      return map;
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  private static Map<String, String> readKoodistoCountries(final String koodistoCountriesPath) {
    try (final InputStream is = Files.newInputStream(Path.of(koodistoCountriesPath))) {
      final List<Lang> koodistoCountries = deserializeJson(is);
      final HashMap<String, String> map = new HashMap<>();
      koodistoCountries.forEach(lang ->
        lang.metadata.forEach(meta -> map.put(meta.nimi().toLowerCase(), lang.koodiArvo))
      );
      return map;
    } catch (final IOException e) {
      throw new RuntimeException(e);
    }
  }

  private static List<Lang> deserializeJson(final InputStream is) throws IOException {
    return new ObjectMapper().readValue(is, new TypeReference<>() {});
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record Lang(@NonNull String koodiArvo, @NonNull List<LangMeta> metadata) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record LangMeta(@NonNull String kieli, @NonNull String nimi) {}
}
