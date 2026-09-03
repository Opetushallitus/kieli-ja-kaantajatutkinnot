package fi.oph.yki.util;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class LocalisationUtil {

  public static final Locale LOCALE_FI = Locale.forLanguageTag("fi");
  public static final Locale LOCALE_SV = Locale.forLanguageTag("sv");
  public static final Locale LOCALE_EN = Locale.forLanguageTag("en");

  public static String translate(final Locale locale, final String key) {
    final ResourceBundle localisation = ResourceBundle.getBundle("localisation", locale);

    return localisation.getString(key);
  }

  public static String translate(final Locale locale, final String key, final Object... args) {
    return MessageFormat.format(translate(locale, key), args);
  }
}
