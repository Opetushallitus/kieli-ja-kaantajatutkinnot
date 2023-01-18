package fi.oph.vkt.service.receipt;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class ReceiptRendererIntegrationTest {

  @Resource
  private ReceiptRenderer receiptRenderer;

  @Test
  public void testHtml() {
    final String html = receiptRenderer.getReceiptHtml(
      ReceiptData
        .builder()
        .dateOfReceipt("24.12.2013")
        .payerName("Raimo Rahamies")
        .paymentDate("24.12.1987")
        .totalAmount("454 €")
        .item(
          ReceiptItem
            .builder()
            .name("Valtionhallinnon kielitutkinnot (VKT) tutkintomaksu")
            .value("454 €")
            .additionalInfos(List.of("Suomi, erinomainen, 28.1.2023", "Osallistuja: Ainolainen, Aino"))
            .build()
        )
        .build()
    );
    assertNotNull(html);
    assertTrue(html.contains("<html "));
    assertTrue(html.contains("Maksupäivä: 24.12.1987"));
  }

  @Test
  public void testPdf() throws IOException, InterruptedException {
    final byte[] pdfBytes = receiptRenderer.getReceiptPdfBytes(
      ReceiptData
        .builder()
        .dateOfReceipt("24.12.2013")
        .payerName("Raimo Rahamies")
        .paymentDate("24.12.1987")
        .totalAmount("454 €")
        .item(
          ReceiptItem
            .builder()
            .name("Valtionhallinnon kielitutkinnot (VKT) tutkintomaksu")
            .value("454 €")
            .additionalInfos(List.of("Suomi, erinomainen, 28.1.2023", "Osallistuja: Ainolainen, Aino"))
            .build()
        )
        .build()
    );
    assertNotNull(pdfBytes);
    assertTrue(pdfBytes.length > 0);
  }
}
