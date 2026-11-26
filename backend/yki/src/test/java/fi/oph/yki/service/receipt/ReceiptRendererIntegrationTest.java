package fi.oph.yki.service.receipt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.util.LocalisationUtil;
import fi.oph.yki.util.TemplateRenderer;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.text.PDFTextStripper;
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
  public void testRenderExamPaymentReceiptPdf() throws IOException {
    final Map<String, Object> params = examPaymentReceiptParams();

    final byte[] pdfBytes = receiptRenderer.renderPdf("receipt-exam-payment", params, LocalisationUtil.LOCALE_FI);

    try (final PDDocument pdf = Loader.loadPDF(pdfBytes)) {
      assertEquals(1, pdf.getNumberOfPages());

      final String text = new PDFTextStripper().getText(pdf);
      assertTrue(text.contains("RCPT-1"));
      assertTrue(text.contains("Meikäläinen"));
      assertTrue(text.contains("Matti"));
      assertTrue(text.contains("Testipaikka Oy"));
      assertTrue(text.contains("35,00 €"));
    }
  }

  @Test
  public void testRenderEvaluationPaymentReceiptPdf() throws IOException {
    final Map<String, Object> params = evaluationPaymentReceiptParams();

    final byte[] pdfBytes = receiptRenderer.renderPdf("receipt-evaluation-payment", params, LocalisationUtil.LOCALE_FI);

    try (final PDDocument pdf = Loader.loadPDF(pdfBytes)) {
      assertEquals(1, pdf.getNumberOfPages());

      final String text = new PDFTextStripper().getText(pdf);
      assertTrue(text.contains("RCPT-2"));
      assertTrue(text.contains("Kirjoittaminen"));
      assertTrue(text.contains("60,00 €"));
    }
  }

  @Test
  public void testRenderPdfUsesEmbeddedLiberationSans() throws IOException {
    final byte[] pdfBytes = receiptRenderer.renderPdf(
      "receipt-exam-payment",
      examPaymentReceiptParams(),
      LocalisationUtil.LOCALE_FI
    );

    try (final PDDocument pdf = Loader.loadPDF(pdfBytes)) {
      final List<String> fontNames = new ArrayList<>();
      final PDResources resources = pdf.getPage(0).getResources();
      for (final COSName fontName : resources.getFontNames()) {
        final PDFont font = resources.getFont(fontName);
        assertTrue(font.isEmbedded());
        fontNames.add(font.getName());
      }

      assertTrue(fontNames.stream().anyMatch(name -> name.endsWith("+LiberationSans")));
      assertTrue(fontNames.stream().anyMatch(name -> name.endsWith("+LiberationSans-Bold")));
    }
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
