package fi.oph.akt.util.prod;

import static fi.oph.akt.util.prod.RowUtils.bool;
import static fi.oph.akt.util.prod.RowUtils.date;
import static fi.oph.akt.util.prod.RowUtils.toStringSqlQuoted;

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
import liquibase.util.csv.opencsv.CSVReader;
import lombok.NonNull;
import org.springframework.data.util.Pair;

public class ProdImport {

  public static void main(String[] args) throws IOException {
    if (args.length != 4) {
      System.out.println(
        "Usage: java ProdImport.java translators.csv translatorLanguages.csv koodisto_kielet.json outfile.txt"
      );
      System.out.println(
        "e.g. java src/main/java/fi/oph/akt/util/prod/ProdImport.java ../akt_data/TRANSLATOR_PERSON-Table\\ 1.csv ../akt_data/TRANSLATOR_LANGUAGE-Table\\ 1.csv src/main/resources/koodisto/koodisto_kielet.json generated_prod_sql.txt"
      );
      System.exit(1);
    }
    final String translatorsPath = args[0];
    final String languagesPath = args[1];
    final String koodistoLangsPath = args[2];
    final String outFile = args[3];

    final Map<String, String> koodistoLangsMap = readKoodistoLanguages(koodistoLangsPath);

    final List<TranslatorRow> translators = parseTranslators(translatorsPath);
    final Map<Integer, List<LanguageRow>> translatorLanguagesMap = parseTranslatorLanguages(languagesPath);

    final Set<Integer> idsOfKnownDuplicateEmails = getTranslatorIdsOfKnownDuplicateEmails(translators);
    final Set<Integer> idsOfKnownDuplicateSsns = getTranslatorIdsOfKnownDuplicateSsns(translators);

    final List<Pair<TranslatorRow, List<LanguageRow>>> translatorsAndLanguages = translators
      .stream()
      .map(t -> {
        final List<LanguageRow> translatorLanguages = translatorLanguagesMap.getOrDefault(t.id(), new ArrayList<>());
        if (t.lastName().isBlank()) {
          System.out.println("Skipping empty translator id" + t.id());
          return null;
        }
        if (translatorLanguages.isEmpty()) {
          System.out.println("Skipping translator with no languages: " + t.id());
          return null;
        }
        final List<LanguageRow> languages = translatorLanguages
          .stream()
          .filter(lang -> lang.shouldBeImported(koodistoLangsMap))
          .flatMap(lang -> lang.splitRenewals(getTranslatorIdsHavingInvalidDates()).stream())
          .toList();
        return Pair.of(t, languages);
      })
      .filter(Objects::nonNull)
      .filter(p -> !p.getSecond().isEmpty())
      .toList();

    FileWriter fileWriter = new FileWriter(outFile);
    PrintWriter printWriter = new PrintWriter(fileWriter);
    printWriter.println("TRUNCATE translator CASCADE;" + "TRUNCATE meeting_date CASCADE;" + "TRUNCATE email CASCADE;");
    final Set<LocalDate> meetingDates = translatorsAndLanguages
      .stream()
      .flatMap(p -> p.getSecond().stream())
      .map(LanguageRow::resolveMeetingDate)
      .filter(Objects::nonNull)
      .collect(Collectors.toSet());
    meetingDates.forEach(date -> {
      final String insertMeetingDateSql = "INSERT INTO meeting_date(date) VALUES ('%s');".formatted(date);
      printWriter.println(insertMeetingDateSql);
    });

    translatorsAndLanguages.forEach(pair -> {
      final TranslatorRow t = pair.getFirst();
      final List<LanguageRow> languages = pair.getSecond();

      final String insertTranslatorSql =
        (
          "WITH inserted_translator AS (INSERT INTO translator(identity_number, first_name, last_name, email, phone_number, street, town, postal_code, country, extra_information, is_assurance_given)" +
          " VALUES ('%s', '%s', '%s', %s, '%s', '%s', '%s', '%s', '%s', '%s', %s)" +
          " RETURNING translator_id)"
        ).formatted(
            sanitizeSsn(idsOfKnownDuplicateSsns, t),
            t.resolveFirstName(),
            t.resolveLastName(),
            sanitizedEmail(idsOfKnownDuplicateEmails, t),
            t.resolvePhone(),
            t.resolveAddress(),
            t.resolveCity(),
            t.postalCode(),
            t.resolveCountry(),
            t.resolveInfo(languages),
            t.resolveIsOathed()
          );
      final List<String> authorisationInserts = new ArrayList<>();
      IntStream
        .range(0, languages.size())
        .forEach(i -> {
          final LanguageRow lang = languages.get(i);
          final Optional<org.apache.commons.lang3.tuple.Pair<LocalDate, LocalDate>> beginAndEnd = lang.resolveStartAndEndDate();
          final String insertAuthorisationSql =
            (
              "inserted_authorisation%s AS (INSERT INTO authorisation (translator_id, basis, meeting_date_id, aut_date, from_lang, to_lang, permission_to_publish, diary_number, term_begin_date, term_end_date)" +
              " SELECT translator_id, '%s', %s, %s, '%s', '%s', %s, %s, %s, %s" +
              " FROM inserted_translator" +
              " RETURNING authorisation_id)"
            ).formatted(
                i,
                lang.resolveBasis(),
                lang.resolveMeetingDate() != null
                  ? "(SELECT meeting_date_id FROM meeting_date WHERE date='%s')".formatted(lang.resolveMeetingDate())
                  : "null",
                lang.resolveAutDate(getTranslatorIdsOfKnownAutMissingExamDate()),
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

  private static Set<Integer> getTranslatorIdsHavingInvalidDates() {
    return Set.of(4298);
  }

  private static Set<Integer> getTranslatorIdsOfKnownAutMissingExamDate() {
    return Set.of(3978, 4298, 4542);
  }

  private static Set<Integer> getTranslatorIdsOfKnownDuplicateEmails(final List<TranslatorRow> translators) {
    final Set<Integer> known = Set.of(524, 527, 554, 555, 1125, 2600, 2612, 2716, 4291, 4514, 4515, 4586);
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
    final Set<Integer> known = Set.of(3044, 4291, 4504, 4514, 4515, 4586);
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
    if (ids.contains(t.id())) {
      System.out.println("FIXME email " + t.id());
      return "'FIXME-" + t.id() + "-" + email + "'";
    }
    if (email.isBlank() || email.equals("-")) {
      return null;
    }
    return "'" + email + "'";
  }

  private static List<TranslatorRow> parseTranslators(final String translatorsPath) throws IOException {
    final CSVReader translatorsCsv = new CSVReader(
      new InputStreamReader(Files.newInputStream(Path.of(translatorsPath))),
      ';'
    );
    final List<String[]> translatorLines = translatorsCsv.readAll();
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

  private static Map<Integer, List<LanguageRow>> parseTranslatorLanguages(final String languagesPath)
    throws IOException {
    final CSVReader languagesCsv = new CSVReader(
      new InputStreamReader(Files.newInputStream(Path.of(languagesPath))),
      ';'
    );
    final Map<Integer, List<LanguageRow>> translatorLanguagesMap = new HashMap<>();

    final List<String[]> languageLines = languagesCsv.readAll();
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

  private static List<Lang> deserializeJson(final InputStream is) throws IOException {
    return new ObjectMapper().readValue(is, new TypeReference<>() {});
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record Lang(@NonNull String koodiArvo, @NonNull List<LangMeta> metadata) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record LangMeta(@NonNull String kieli, @NonNull String nimi) {}
}
