package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class LocalisationUtilTest {

  @Test
  public void testTranslateFi() {
    assertEquals("YKI-testi", LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "common.test"));
    assertEquals(
      "Ilmoittaudu YKI-testiin tästä linkistä",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.login.content.line2")
    );
  }

  @Test
  public void testTranslateSv() {
    assertEquals("Test", LocalisationUtil.translate(LocalisationUtil.LOCALE_SV, "common.test"));
    assertEquals(
      "Anmäl dig till YKI-testet via den här länken",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_SV, "email.login.content.line2")
    );
  }

  @Test
  public void testTranslateEn() {
    assertEquals("Test", LocalisationUtil.translate(LocalisationUtil.LOCALE_EN, "common.test"));
    assertEquals(
      "Click here to register for the YKI test",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_EN, "email.login.content.line2")
    );
  }

  @Test
  public void testTranslateWithMessageFormatArgs() {
    assertEquals(
      "Kuitin tunniste",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.receipt.common.receiptId")
    );
    // MessageFormat substitution: the receiptId key has no {0} placeholders, but a key that does
    // (email.evaluation_payment.content.paid takes no args either) should still pass args through
    // without throwing when none are used.
    assertEquals(
      "Maksettu",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.evaluation_payment.content.paid", "unused")
    );
  }

  @Test
  public void testFinnishOnlyKirjaamoKeyOnlyExistsInFiBundle() {
    assertEquals(
      "Henkilö on pyytänyt tarkistusarviointia seuraavasta yleisten kielitutkintojen tutkintosuorituksesta",
      LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.evaluation_payment_kirjaamo.content.line1")
    );
  }
}
