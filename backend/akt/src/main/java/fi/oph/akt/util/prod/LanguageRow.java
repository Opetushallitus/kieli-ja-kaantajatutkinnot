package fi.oph.akt.util.prod;

import static fi.oph.akt.util.prod.RowUtils.firstNonNull;
import static fi.oph.akt.util.prod.RowUtils.toStringSqlQuoted;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.Builder;
import org.apache.commons.lang3.tuple.Pair;

public record LanguageRow(
  int translatorId,
  String from,
  String to,
  boolean authorisationStatusDer,
  LocalDate authorisationExamCertificateDate,
  LocalDate authorisationExamDate,
  LocalDate authorisationCertificateDate,
  LocalDate authorisationStatusDateEnd,
  String authorisationBasis,
  String authorisationBasisDiary,
  String authorisationRenewDiary,
  boolean oathedStatusDer,
  LocalDate oathedExamDate,
  LocalDate certificateDate,
  String statusDateEnd,
  boolean officialStatusDer,
  LocalDate officialExamDate,
  LocalDate officialCertificateDate,
  LocalDate officialStatusDateEnd,
  boolean specialStatus,
  boolean languageInstituteStatus,
  boolean correctionRequestStatus,
  LocalDate authorisationRenewDate,
  LocalDate authorisationRenewEndDate
) {
  @Builder
  public LanguageRow {}

  public boolean shouldBeImported(final Map<String, String> langs) {
    final String origFrom = convertLangNameToKoodistoName(from);
    final String origTo = convertLangNameToKoodistoName(to);
    final String from = langs.get(origFrom);
    final String to = langs.get(origTo);
    if (from == null || to == null) {
      if (translatorId != 4575) {
        System.out.println("Invalid language: " + translatorId + " from:" + origFrom + " to:" + origTo);
      }
      System.out.println("Skipping language " + this);
      return false;
    }
    return true;
  }

  public String resolveFrom(final Map<String, String> koodistoLangsMap) {
    return koodistoLangsMap.get(convertLangNameToKoodistoName(from));
  }

  public String resolveTo(final Map<String, String> koodistoLangsMap) {
    return koodistoLangsMap.get(convertLangNameToKoodistoName(to));
  }

  private static String convertLangNameToKoodistoName(final String s) {
    return switch (s) {
      case "tsekki" -> "tšekki";
      case "kroaatti" -> "kroatia";
      case "persia" -> "persia, farsi";
      case "koltansaame" -> "kolttasaame";
      case "kurdi (sorani)" -> "kurdi sorani";
      case "kurmandzi" -> "kurdi kurmandzi";
      case "kurdi (kurmandzi)" -> "kurdi kurmandzi";
      default -> s;
    };
  }

  public String resolveAutDate(final Set<Integer> translatorIdsHavingAutWithoutExamDate) {
    if (Objects.equals("AUT", authorisationBasis)) {
      if (authorisationExamDate == null) {
        if (translatorIdsHavingAutWithoutExamDate.contains(translatorId)) {
          System.out.println("FIXME known AUT but authorisationExamDate is null, " + translatorId);
          return toStringSqlQuoted(LocalDate.of(1900, 1, 1));
        }
        throw new RuntimeException("AUT but authorisationExamDate is null " + translatorId);
      }
      return toStringSqlQuoted(authorisationExamDate);
    }
    return null;
  }

  public LocalDate resolveMeetingDate() {
    // FIXME
    return firstNonNull(
      authorisationCertificateDate,
      authorisationExamCertificateDate,
      authorisationExamDate,
      officialCertificateDate
    )
      .orElse(null);
  }

  public Optional<Pair<LocalDate, LocalDate>> resolveStartAndEndDate() {
    return resolveStartDate().map(start -> Pair.of(start, resolveEndDate(start)));
  }

  private Optional<LocalDate> resolveStartDate() {
    // FIXME mikä aloituspäivä pitää valita jos authorisationCertificateDate ei ole ja KKT tai AUT?
    return firstNonNull(
      authorisationCertificateDate,
      officialCertificateDate,
      authorisationExamCertificateDate,
      authorisationExamDate
    );
  }

  private LocalDate resolveEndDate(final LocalDate beginDate) {
    if (authorisationBasis.isBlank() || Objects.equals("VIR", authorisationBasis)) {
      if (authorisationStatusDateEnd != null) {
        System.out.println("FIXME VIR but authorisationStatusDateEnd defined, id:" + translatorId);
      }
      return null;
    }
    if (authorisationStatusDateEnd != null && !Objects.equals(authorisationStatusDateEnd, beginDate)) {
      return authorisationStatusDateEnd;
    }
    System.out.println("FIXME authorisationStatusDateEnd is not defined, id:" + translatorId);
    return beginDate.plusYears(5);
  }

  public String resolveDiary() {
    if (authorisationBasisDiary.isBlank() && !authorisationRenewDiary.isBlank()) {
      return toStringSqlQuoted(authorisationRenewDiary);
    }
    if (!authorisationBasisDiary.isBlank()) {
      return toStringSqlQuoted(authorisationBasisDiary);
    }
    return null;
  }

  public String resolveBasis() {
    return authorisationBasis.isBlank() ? "VIR" : authorisationBasis;
  }

  public List<LanguageRow> splitRenewals(final Set<Integer> translatorIdsHavingInvalidDates) {
    if (authorisationRenewDate != null && !"VIR".equals(resolveBasis())) {
      if (translatorIdsHavingInvalidDates.contains(translatorId)) {
        System.out.println("FIXME invalid begin, end and renewal dates id:" + translatorId);
        return List.of(this);
      }
      return resolveStartAndEndDate()
        .map(dates -> {
          final LocalDate firstBegin = dates.getLeft();
          final LocalDate firstEnd = authorisationRenewDate;

          final LocalDate secondBegin = authorisationRenewDate;
          final LocalDate secondEnd = dates.getRight();

          if (firstBegin.isAfter(firstEnd) || secondBegin.isAfter(secondEnd) || firstEnd.isAfter(secondBegin)) {
            throw new RuntimeException(
              "Invalid begin, end or renewal date, but id not in list of known problems. id:" + translatorId
            );
          }

          final LanguageRowBuilder first = copyAsBuilder(this);
          first.authorisationBasisDiary(authorisationBasisDiary);
          first.authorisationCertificateDate(firstBegin);
          first.authorisationStatusDateEnd(firstEnd);

          final LanguageRowBuilder second = copyAsBuilder(this);
          second.authorisationBasisDiary(authorisationRenewDiary);
          second.authorisationCertificateDate(secondBegin);
          second.authorisationStatusDateEnd(secondEnd);

          return List.of(first.build(), second.build());
        })
        .get();
    }
    return List.of(this);
  }

  private static LanguageRowBuilder copyAsBuilder(final LanguageRow lang) {
    return LanguageRow
      .builder()
      .translatorId(lang.translatorId)
      .from(lang.from)
      .to(lang.to)
      .authorisationStatusDer(lang.authorisationStatusDer)
      .authorisationExamCertificateDate(lang.authorisationExamCertificateDate)
      .authorisationExamDate(lang.authorisationExamDate)
      .authorisationCertificateDate(lang.authorisationCertificateDate)
      .authorisationStatusDateEnd(lang.authorisationStatusDateEnd)
      .authorisationBasis(lang.authorisationBasis)
      .authorisationBasisDiary(lang.authorisationBasisDiary)
      .authorisationRenewDiary(lang.authorisationRenewDiary)
      .oathedStatusDer(lang.oathedStatusDer)
      .oathedExamDate(lang.oathedExamDate)
      .certificateDate(lang.certificateDate)
      .statusDateEnd(lang.statusDateEnd)
      .officialStatusDer(lang.officialStatusDer)
      .officialExamDate(lang.officialExamDate)
      .officialCertificateDate(lang.officialCertificateDate)
      .officialStatusDateEnd(lang.officialStatusDateEnd)
      .specialStatus(lang.specialStatus)
      .languageInstituteStatus(lang.languageInstituteStatus)
      .correctionRequestStatus(lang.correctionRequestStatus)
      .authorisationRenewDate(lang.authorisationRenewDate)
      .authorisationRenewEndDate(lang.authorisationRenewEndDate);
  }
}
