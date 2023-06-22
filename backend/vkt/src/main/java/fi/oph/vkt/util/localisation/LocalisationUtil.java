package fi.oph.vkt.util.localisation;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class LocalisationUtil {

  private static final ResourceBundle bundleFI = ResourceBundle.getBundle("localisation", Locale.forLanguageTag("fi"));
  private static final ResourceBundle bundleSV = ResourceBundle.getBundle("localisation", Locale.forLanguageTag("sv"));

  public static String translate(final Language language, final String key) {
    final ResourceBundle bundle = language == Language.FI ? bundleFI : bundleSV;

    return bundle.getString(key);
  }

  public static String translate(final Language language, final String key, final Object... args) {
    return MessageFormat.format(translate(language, key), args);
  }
}
