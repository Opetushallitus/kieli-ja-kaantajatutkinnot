package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class EmailSubjectUtilTest {

  @Test
  public void testBuildExamSubjectFi() {
    final String subject = EmailSubjectUtil.buildExamSubject(
      LocalisationUtil.LOCALE_FI,
      "cancel_registration",
      "Suomi",
      "Keskitaso",
      "Testipaikka Oy",
      "24.06.2026"
    );

    assertEquals(
      LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.cancel_registration.subject") +
      ": Suomi keskitaso - Testipaikka Oy, 24.06.2026",
      subject
    );
  }
}
