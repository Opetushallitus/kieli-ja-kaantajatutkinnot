package fi.oph.vkt.util.localisation;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class LocalisationUtil {

  private static final ResourceBundle localisationFI = ResourceBundle.getBundle(
    "localisation",
    Locale.forLanguageTag("fi")
  );

  private static final ResourceBundle localisationSV = ResourceBundle.getBundle(
    "localisation",
    Locale.forLanguageTag("sv")
  );

  public static String translate(final Language language, final String key) {
    final ResourceBundle localisation = language == Language.FI ? localisationFI : localisationSV;

    return localisation.getString(key);
  }

  public static String translate(final Language language, final String key, final Object... args) {
    return MessageFormat.format(translate(language, key), args);
  }
}
