package fi.oph.yki.service.receipt;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.TemplateRenderer;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
class ReceiptRendererIntegrationTest {

  @Resource
  private ReceiptRenderer receiptRenderer;

  @Resource
  private TemplateRenderer templateRenderer;

  @Test
  public void testRenderExamPaymentReceiptHtml() {
    final Map<String, Object> params = examPaymentReceiptParams();

    final String html = templateRenderer.render("receipt-exam-payment", params, LocalisationUtil.LOCALE_FI);

    assertNotNull(html);
    assertTrue(html.contains("<html"));
    assertTrue(html.contains("RCPT-1"));
    assertTrue(html.contains("Meikäläinen"));
    assertTrue(html.contains("Matti"));
    assertTrue(html.contains("35,00"));
  }

  @Test
  public void testRenderEvaluationPaymentReceiptHtmlWithSubtestItems() {
    final Map<String, Object> params = evaluationPaymentReceiptParams();

    final String html = templateRenderer.render("receipt-evaluation-payment", params, LocalisationUtil.LOCALE_FI);

    assertNotNull(html);
    assertTrue(html.contains("<html"));
    assertTrue(html.contains("Kirjoittaminen"));
    assertTrue(html.contains("60,00"));
  }

  @Test
  public void testRenderExamPaymentReceiptPdfBytes() throws IOException, InterruptedException {
    final Map<String, Object> params = examPaymentReceiptParams();

    final byte[] pdfBytes = receiptRenderer.renderPdf("receipt-exam-payment", params, LocalisationUtil.LOCALE_FI);

    assertNotNull(pdfBytes);
    assertTrue(pdfBytes.length > 0);
  }

  @Test
  public void testRenderEvaluationPaymentReceiptPdfBytes() throws IOException, InterruptedException {
    final Map<String, Object> params = evaluationPaymentReceiptParams();

    final byte[] pdfBytes = receiptRenderer.renderPdf("receipt-evaluation-payment", params, LocalisationUtil.LOCALE_FI);

    assertNotNull(pdfBytes);
    assertTrue(pdfBytes.length > 0);
  }

  private Map<String, Object> examPaymentReceiptParams() {
    final Map<String, Object> params = new HashMap<>();
    params.put("receipt_id", "RCPT-1");
    params.put("receipt_date", "25.12.2026");
    params.put("payment_date", "24.12.2026");
    params.put("language", "Suomi");
    params.put("level", "Perustaso");
    params.put("exam_date", "28.01.2027");
    params.put("last_name", "Meikäläinen");
    params.put("first_name", "Matti");
    params.put("organizer_name", "Testipaikka Oy");
    params.put("street_address", "Testikatu 1");
    params.put("zip", "00100");
    params.put("post_office", "Helsinki");
    params.put("amount", "35,00");
    return params;
  }

  private Map<String, Object> evaluationPaymentReceiptParams() {
    final Map<String, Object> params = new HashMap<>();
    params.put("receipt_id", "RCPT-2");
    params.put("receipt_date", "25.12.2026");
    params.put("payment_date", "24.12.2026");
    params.put("language", "Suomi");
    params.put("level", "Perustaso");
    params.put("exam_date", "28.01.2027");
    params.put("last_name", "Meikäläinen");
    params.put("first_name", "Matti");
    params.put("amount", "60,00");
    params.put("subtests", List.of(Map.of("name", "Kirjoittaminen", "price", Map.of("emailTemplate", "60,00"))));
    return params;
  }
}
