package fi.oph.vkt.model.type;

public enum AppLocale {
  FI,
  SV;

  public static AppLocale fromString(final String text) {
    for (final AppLocale al : AppLocale.values()) {
      if (al.name().equalsIgnoreCase(text)) {
        return al;
      }
    }

    return FI;
  }
}
