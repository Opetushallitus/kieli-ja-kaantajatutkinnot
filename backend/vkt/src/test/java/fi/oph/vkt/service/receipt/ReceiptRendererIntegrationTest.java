package fi.oph.vkt.service.receipt;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.vkt.util.LocalisationUtil;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class ReceiptRendererIntegrationTest {

  @Resource
  private ReceiptRenderer receiptRenderer;

  @Test
  public void testGetReceiptHtml() {
    final String html = receiptRenderer.getReceiptHtml(
      ReceiptData
        .builder()
        .date("25.12.2022")
        .paymentDate("24.12.2022")
        .paymentReference("RF-123")
        .exam("Suomi, erinomainen taito, 28.1.2023")
        .participant("Ainolainen, Aino")
        .totalAmount("25 €")
        .items(
          List.of(
            ReceiptItem.builder().name("Kirjallinen taito").amount("10 €").build(),
            ReceiptItem.builder().name("Suullinen taito").amount("15 €").build()
          )
        )
        .build(),
      LocalisationUtil.localeFI
    );
    assertNotNull(html);
    assertTrue(html.contains("<html "));
    assertTrue(html.contains("25.12.2022"));
    assertTrue(html.contains("<span>Maksupäivä</span>: 24.12.2022"));
    assertTrue(html.contains("<span>Maksun viite</span>: RF-123"));
    assertTrue(html.contains("<span>Tutkinto</span>: Suomi, erinomainen taito, 28.1.2023"));
    assertTrue(html.contains("<span>Osallistuja</span>: Ainolainen, Aino"));
    assertTrue(html.contains("Kirjallinen taito"));
    assertTrue(html.contains("Suullinen taito"));
    assertTrue(html.contains("10 €"));
    assertTrue(html.contains("15 €"));
    assertTrue(html.contains("25 €"));
  }

  @Test
  public void testGetReceiptPdfBytes() throws IOException, InterruptedException {
    final byte[] pdfBytes = receiptRenderer.getReceiptPdfBytes(
      ReceiptData
        .builder()
        .date("25.12.2022")
        .paymentDate("24.12.2022")
        .paymentReference("RF-123")
        .exam("Suomi, erinomainen taito, 28.1.2023")
        .participant("Ainolainen, Aino")
        .totalAmount("25 €")
        .items(
          List.of(
            ReceiptItem.builder().name("Kirjallinen taito").amount("10 €").build(),
            ReceiptItem.builder().name("Suullinen taito").amount("15 €").build()
          )
        )
        .build(),
      LocalisationUtil.localeFI
    );
    assertNotNull(pdfBytes);
    assertTrue(pdfBytes.length > 0);
  }
}
