package fi.oph.akr.util.prod;

import static fi.oph.akr.util.prod.RowUtils.sqlEscapeQuotes;
import static fi.oph.akr.util.prod.RowUtils.toStringSqlQuoted;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.Builder;
import org.apache.commons.lang.StringUtils;

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

  public String resolveCity(final Map<Integer, String> translatorCityFixes) {
    if (translatorCityFixes.containsKey(id)) {
      return sqlEscapeQuotes(capitalize(translatorCityFixes.get(id)));
    }
    final String trimmedCity = fixGermanyAndNetherlands(city.trim());
    final String trimmedCountry = fixGermanyAndNetherlands(country.trim());
    if (
      !trimmedCountry.isEmpty() &&
      trimmedCity.length() > trimmedCountry.length() &&
      trimmedCity.toLowerCase().endsWith(" " + trimmedCountry.toLowerCase())
    ) {
      final String cityWithoutCountry = trimmedCity.substring(0, trimmedCity.length() - trimmedCountry.length()).trim();
      return sqlEscapeQuotes(capitalize(cityWithoutCountry));
    }
    return sqlEscapeQuotes(capitalize(trimmedCity));
  }

  private String capitalize(final String s) {
    return StringUtils.capitalize(s.toLowerCase());
  }

  public String resolveCountry(final Set<Integer> knownFinnishAddresses, final Map<String, String> countryNameToCode) {
    if (knownFinnishAddresses.contains(id)) {
      return null;
    }
    final String trimmedCountry = country.trim();
    if (trimmedCountry.isEmpty()) {
      return null;
    }
    if (trimmedCountry.equalsIgnoreCase("suomi")) {
      return null;
    }
    final String typosFixed = fixGermanyAndNetherlands(trimmedCountry);
    final String translationFixed = fixCountryTranslation(typosFixed);
    final String code = countryNameToCode.get(translationFixed.toLowerCase());
    if (code == null) {
      throw new RuntimeException("Country code not found for " + translationFixed);
    }
    return toStringSqlQuoted(code);
  }

  private static String fixGermanyAndNetherlands(final String str) {
    return str
      .replace("Deutshland", "Deutschland")
      .replace("DEUTSHLAND", "Deutschland")
      .replace("DEUTSCHLAND", "Deutschland")
      .replace("Saksa", "Deutschland")
      .replace("NETHERLANS", "Netherlands");
  }

  private String fixCountryTranslation(final String s) {
    return switch (s) {
      case "BELGIQUE", "Belgique", "Belgian kuningaskunta" -> "Belgia";
      case "Deutschland" -> "Saksa";
      case "Iso-Britannia", "Yhdistynyt kuningaskunta", "ENGLANTI" -> "Britannia";
      case "Francais" -> "Ranska";
      case "ESPAGNE", "Espagne", "España" -> "Espanja";
      case "Österreich" -> "Itävalta";
      case "The United States", "USA", "Yhdysvallat" -> "Yhdysvallat (USA)";
      case "Luxenburg" -> "Luxemburg";
      case "SUISSE", "Suisse" -> "Sveitsi";
      case "EMIRATS ARABES UNIS" -> "Arabiemiirikunnat";
      case "Ruotsin kuningaskunta" -> "Ruotsi";
      default -> s;
    };
  }

  public boolean resolveIsOathed() {
    return oathedDate != null || oathedStatus;
  }
}
