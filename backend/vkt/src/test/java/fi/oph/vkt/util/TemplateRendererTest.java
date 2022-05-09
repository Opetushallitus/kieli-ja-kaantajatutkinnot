package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
  public void testRenderExample() {
    final String renderedContent = templateRenderer.renderExample(Map.of("key", "value"));

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("This is a placeholder value, just for an example."));
  }
}
