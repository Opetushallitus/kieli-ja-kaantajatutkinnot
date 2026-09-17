package fi.oph.yki.util;

import java.util.Locale;

public class EmailSubjectUtil {

  public static String buildExamSubject(
    final Locale locale,
    final String emailTypeKey,
    final String language,
    final String level,
    final String testCentreName,
    final String examDate
  ) {
    final String subjectStub = LocalisationUtil.translate(locale, "email." + emailTypeKey + ".subject");

    return String.format(
      "%s: %s %s - %s, %s",
      subjectStub,
      language,
      level.toLowerCase(locale),
      testCentreName,
      examDate
    );
  }
}
