package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.PostgresTestcontainerConfig;
import jakarta.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
class TemplateRendererTest {

  private static final List<Locale> ALL_LOCALES = List.of(
    LocalisationUtil.LOCALE_FI,
    LocalisationUtil.LOCALE_SV,
    LocalisationUtil.LOCALE_EN
  );

  @Resource
  private TemplateRenderer templateRenderer;

  private Map<String, Object> baseExamParams() {
    final Map<String, Object> params = new HashMap<>();
    params.put("language", "Suomi");
    params.put("level", "Perustaso");
    params.put("subtests", List.of("Kuunteleminen", "Puhuminen"));
    params.put("exam_date", "24.06.2026");
    params.put("name", "Testipaikka Oy");
    params.put("street_address", "Testikatu 1");
    params.put("zip", "00100");
    params.put("post_office", "Helsinki");
    params.put("login_url", "https://example.com/login");
    params.put("user_portal_link", "https://example.com/portal");
    params.put("amount", "35,00");
    params.put("expiration_date", "10.07.2026");
    return params;
  }

  @Test
  public void testRenderLogin() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("login", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login.content.line2")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login.link_text")));
    }
  }

  @Test
  public void testRenderLoginQueue() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("login-queue", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login_queue.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login_queue.link_text")));
    }
  }

  @Test
  public void testRenderLoginRenew() {
    final Map<String, Object> params = new HashMap<>();
    params.put("login_url", "https://example.com/portal");
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("login-renew", params, locale);
      assertNotNull(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login_renew.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.login_renew.content.link")));
      assertTrue(content.contains("https://example.com/portal"));
    }
  }

  @Test
  public void testRenderPayment() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("payment", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment.content.line1.part1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment.link_text")));
      assertTrue(content.contains("35,00"));
      assertTrue(content.contains("10.07.2026"));
    }
  }

  @Test
  public void testRenderPaymentFromQueue() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("payment-from-queue", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_from_queue.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_from_queue.link_text")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_success.content.line6")));
    }
  }

  @Test
  public void testRenderPaymentSuccessWithoutOptionalBlocks() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("payment-success", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_success.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_success.content.line7")));
      assertFalse(
        content.contains(LocalisationUtil.translate(locale, "email.payment_success.extra_information.label"))
      );
      assertFalse(
        content.contains(LocalisationUtil.translate(locale, "email.payment_success.organizer_contact.label"))
      );
    }
  }

  @Test
  public void testRenderPaymentSuccessWithOptionalBlocks() {
    final Map<String, Object> params = baseExamParams();
    params.put("extra_information", "Muista tuoda kynä mukanasi.");
    params.put(
      "contact_info",
      Map.of("name", "Matti Meikäläinen", "email", "matti@example.com", "phone_number", "0401234567")
    );
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("payment-success", params, locale);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_success.extra_information.label")));
      assertTrue(content.contains("Muista tuoda kynä mukanasi."));
      // th:text HTML-escapes apostrophes (present in the "en" label) as "&#39;" - normalize before comparing.
      assertTrue(
        content.contains(
          LocalisationUtil.translate(locale, "email.payment_success.organizer_contact.label").replace("'", "&#39;")
        )
      );
      assertTrue(content.contains("Matti Meikäläinen"));
      assertTrue(content.contains("matti@example.com"));
      assertTrue(content.contains("0401234567"));
    }
  }

  @Test
  public void testRenderFreeRegistration() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("free-registration", params, locale);
      assertNotNull(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.free_registration.content.line1.part1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.payment_success.content.line1")));
      assertTrue(content.contains("24.06.2026"));
    }
  }

  @Test
  public void testRenderFreeRegistrationFromQueue() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("free-registration-from-queue", params, locale);
      assertNotNull(content);
      assertTrue(
        content.contains(LocalisationUtil.translate(locale, "email.free_registration_from_queue.content.line1"))
      );
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.free_registration.content.line1.part1")));
    }
  }

  @Test
  public void testRenderQueue() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("queue", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.queue.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.queue.content.line4.link.text")));
    }
  }

  @Test
  public void testRenderCancelRegistration() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("cancel-registration", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.cancel_registration.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.cancel_registration.content.link.text")));
    }
  }

  @Test
  public void testRenderCancelFreeRegistration() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("cancel-free-registration", params, locale);
      assertNotNull(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.cancel_free_registration.content.line1")));
      assertTrue(content.contains("24.06.2026"));
    }
  }

  @Test
  public void testRenderCancelQueue() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("cancel-queue", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.cancel_queue.content.line1")));
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.cancel_queue.content.link.text")));
    }
  }

  @Test
  public void testRenderTransferConfirmation() {
    final Map<String, Object> params = baseExamParams();
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("transfer-confirmation", params, locale);
      assertCommonExamContent(content);
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.transfer_confirmation.content.line1")));
      assertTrue(
        content.contains(
          LocalisationUtil.translate(locale, "email.transfer_confirmation.content.special_arrangements.info1")
        )
      );
    }
  }

  @Test
  public void testRenderEvaluationPaymentSuccess() {
    final Map<String, Object> params = new HashMap<>();
    params.put("language", "Suomi");
    params.put("level", "Perustaso");
    params.put("exam_date", "24.06.2026");
    params.put("subtests", List.of("Kirjoittaminen", "Puhuminen"));
    params.put("order_time", "20.06.2026");
    params.put("amount", "60,00");
    for (final Locale locale : ALL_LOCALES) {
      final String content = templateRenderer.render("evaluation-payment-success", params, locale);
      assertNotNull(content);
      assertTrue(
        content.contains(LocalisationUtil.translate(locale, "email.evaluation_payment_success.content.line1"))
      );
      assertTrue(content.contains(LocalisationUtil.translate(locale, "email.evaluation_payment.content.total")));
      assertTrue(content.contains("Kirjoittaminen"));
      assertTrue(content.contains("60,00"));
      assertTrue(content.contains("20.06.2026"));
    }
  }

  @Test
  public void testRenderEvaluationPaymentKirjaamoIsFinnishOnly() {
    final Map<String, Object> params = new HashMap<>();
    params.put("language", "Suomi");
    params.put("level", "Perustaso");
    params.put("exam_date", "24.06.2026");
    params.put("subtests", List.of("Kirjoittaminen"));
    params.put("last_name", "Meikäläinen");
    params.put("first_names", "Matti Juhani");
    params.put("birthdate", "01.01.1990");
    params.put("email", "matti@example.com");
    params.put("order_number", "12345");
    params.put("order_time", "20.06.2026");
    params.put("amount", "60,00");

    final String content = templateRenderer.render("evaluation-payment-kirjaamo", params, LocalisationUtil.LOCALE_FI);
    assertNotNull(content);
    assertTrue(
      content.contains(
        LocalisationUtil.translate(LocalisationUtil.LOCALE_FI, "email.evaluation_payment_kirjaamo.content.line1")
      )
    );
    assertTrue(content.contains("Meikäläinen"));
    assertTrue(content.contains("Matti Juhani"));
    assertTrue(content.contains("matti@example.com"));
    assertTrue(content.contains("12345"));
  }

  private void assertCommonExamContent(final String content) {
    assertNotNull(content);
    assertTrue(content.contains("<html"));
    assertTrue(content.contains("Suomi"));
    assertTrue(content.contains("perustaso"));
    assertTrue(content.contains("Kuunteleminen"));
    assertTrue(content.contains("24.06.2026"));
    assertTrue(content.contains("Testipaikka Oy"));
    assertTrue(content.contains("HELSINKI"));
  }
}
