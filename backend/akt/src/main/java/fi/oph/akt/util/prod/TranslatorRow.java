package fi.oph.akt.util.prod;

import static fi.oph.akt.util.prod.RowUtils.sqlEscapeQuotes;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import lombok.Builder;

record TranslatorRow(
  int id,
  String lastName,
  String lastNamePrevious,
  String firstName,
  String ssn,
  String address,
  String postalCode,
  String city,
  String country,
  String phoneHome,
  String phoneWork,
  String email,
  String education,
  String faculty,
  String title,
  boolean oathedStatus,
  LocalDate oathedDate,
  boolean officialStatus,
  LocalDate officialDate,
  boolean authorisationStatus,
  LocalDate authorisationDate,
  boolean officialListPublishPermitted,
  boolean internetPublishBanned,
  String info
) {
  @Builder
  public TranslatorRow {}

  public String resolveInfo(final List<LanguageRow> languages) {
    return (
      sqlEscapeQuotes(info) +
      makeInfoRow("Alkuperäinen sukunimi", sqlEscapeQuotes(lastNamePrevious)) +
      makeInfoRow("Puhelin koti", phoneHome) +
      makeInfoRow("Puhelin työ", phoneWork) +
      makeVirInfoRow(languages)
    );
  }

  private static String makeInfoRow(final String fieldName, final String fieldValue) {
    if (fieldValue.isBlank()) {
      return "";
    }
    return "\n-----\n" + fieldName + ": " + fieldValue;
  }

  private static String makeVirInfoRow(final List<LanguageRow> languages) {
    final StringBuilder out = new StringBuilder();
    for (LanguageRow lang : languages) {
      if (lang.authorisationBasis().isBlank() || Objects.equals("VIR", lang.authorisationBasis())) {
        out.append("\n-----\n");
        out.append("VIR ");
        out.append(lang.from());
        out.append(" - ");
        out.append(lang.to());

        out.append("\noathed exam date:");
        out.append(lang.oathedExamDate() != null ? lang.oathedExamDate() : "");

        out.append("\nofficial exam date:");
        out.append(lang.officialExamDate() != null ? lang.officialExamDate() : "");

        out.append("\nofficial certificate date:");
        out.append(lang.officialCertificateDate() != null ? lang.officialCertificateDate() : "");
      }
    }
    return out.toString();
  }

  public String resolvePhone() {
    // FIXME tyhjennä ne joissa pelkästään "-"?
    if (!phoneHome.isBlank()) {
      return phoneHome;
    }
    return phoneWork;
  }

  public String resolveFirstName() {
    return sqlEscapeQuotes(firstName).trim();
  }

  public String resolveLastName() {
    return sqlEscapeQuotes(lastName).trim();
  }

  public String resolveAddress() {
    return sqlEscapeQuotes(address.trim());
  }

  public String resolveCity() {
    final String trimmedCity = fixGermanyAndNetherlands(city.trim());
    final String trimmedCountry = fixGermanyAndNetherlands(country.trim());
    if (
      !trimmedCountry.isEmpty() &&
      trimmedCity.length() > trimmedCountry.length() &&
      trimmedCity.toLowerCase().endsWith(" " + trimmedCountry.toLowerCase())
    ) {
      final String cityWithoutCountry = trimmedCity.substring(0, trimmedCity.length() - trimmedCountry.length()).trim();
      return sqlEscapeQuotes(cityWithoutCountry);
    }
    return sqlEscapeQuotes(trimmedCity);
  }

  public String resolveCountry() {
    final String trimmedCountry = country.trim();
    return fixGermanyAndNetherlands(trimmedCountry);
  }

  private static String fixGermanyAndNetherlands(final String str) {
    return str
      .replace("Deutshland", "Deutschland")
      .replace("DEUTSHLAND", "Deutschland")
      .replace("DEUTSCHLAND", "Deutschland")
      .replace("Saksa", "Deutschland")
      .replace("NETHERLANS", "Netherlands");
  }

  public boolean resolveIsOathed() {
    return oathedDate != null || oathedStatus;
  }
}
