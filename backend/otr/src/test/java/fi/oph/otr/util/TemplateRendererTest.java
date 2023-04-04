package fi.oph.otr.util;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.annotation.Resource;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class TemplateRendererTest {

  @Resource
  private TemplateRenderer templateRenderer;

  @Test
  public void testQualificationExpiryTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderQualificationExpiryEmailBody(
      Map.of("interpreterName", "Erkki Esimerkki", "langPairFI", "suomi - japani", "expiryDate", "06.02.2022")
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("Erkki Esimerkki"));
    assertTrue(renderedContent.contains("suomi - japani"));
    assertTrue(renderedContent.contains("06.02.2022"));
  }
}
