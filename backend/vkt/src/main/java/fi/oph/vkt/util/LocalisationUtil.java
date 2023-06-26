package fi.oph.vkt.util;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class LocalisationUtil {

  public static Locale localeFI = Locale.forLanguageTag("fi");
  public static Locale localeSV = Locale.forLanguageTag("sv");

  public static String translate(final Locale locale, final String key) {
    final ResourceBundle localisation = ResourceBundle.getBundle("localisation", locale);

    return localisation.getString(key);
  }

  public static String translate(final Locale locale, final String key, final Object... args) {
    return MessageFormat.format(translate(locale, key), args);
  }
}
