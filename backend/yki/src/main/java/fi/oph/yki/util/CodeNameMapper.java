package fi.oph.yki.util;

import java.util.Map;

public class CodeNameMapper {

  private static final Map<String, String> LANGUAGE_NAMES_FI = Map.of(
    "fin",
    "suomi",
    "swe",
    "ruotsi",
    "eng",
    "englanti",
    "spa",
    "espanja",
    "ita",
    "italia",
    "fra",
    "ranska",
    "sme",
    "saame",
    "deu",
    "saksa",
    "rus",
    "venäjä"
  );

  private static final Map<String, String> LEVEL_NAMES_FI = Map.of(
    "PERUS",
    "Perustaso",
    "KESKI",
    "Keskitaso",
    "YLIN",
    "Ylin taso"
  );

  public static String languageName(final String code) {
    return LANGUAGE_NAMES_FI.getOrDefault(code, code);
  }

  public static String levelName(final String code) {
    return LEVEL_NAMES_FI.getOrDefault(code, code);
  }
}
