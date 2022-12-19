package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class TemplateRendererTest {

  @Resource
  private TemplateRenderer templateRenderer;

  @Test
  public void testRenderReceipt() {
    final Map<String, Object> params = Map.of(
      "dateOfReceipt",
      "24.12.2022",
      "payerName",
      "Väinöläinen, Väinö",
      "paymentDate",
      "24.12.1987",
      "totalAmount",
      "454 €",
      "item",
      Map.of(
        "name",
        "Valtionhallinnon kielitutkinnot (VKT) tutkintomaksu",
        "value",
        "454 €",
        "additionalInfos",
        List.of("Suomi, erinomainen, 28.1.2023", "Osallistuja: Ainolainen, Aino")
      )
    );

    final String renderedContent = templateRenderer.renderReceipt(params);

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("Suomi, erinomainen, 28.1.2023"));
  }
}
