package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
  public void testRenderEnrollmentConfirmation() {
    final Map<String, Object> params = getCommonEnrollmentConfirmationParams();
    final String content = templateRenderer.renderEnrollmentConfirmationEmailBody(params);

    assertCommonEnrollmentConfirmationEmailContent(content);
    assertTrue(content.contains("maksukuitti"));
  }

  @Test
  public void testRenderEnrollmentToQueueConfirmation() {
    final Map<String, Object> params = getCommonEnrollmentConfirmationParams();
    final String content = templateRenderer.renderEnrollmentToQueueConfirmationEmailBody(params);

    assertCommonEnrollmentConfirmationEmailContent(content);
    assertFalse(content.contains("maksukuitti"));
  }

  private Map<String, Object> getCommonEnrollmentConfirmationParams() {
    return Map.of(
      "examLanguageFI",
      "suomi",
      "examLevelFI",
      "erinomainen",
      "examDate",
      "10.06.2023",
      "skillsFI",
      "kirjallinen taito, suullinen taito",
      "partialExamsFI",
      "kirjoittaminen, tekstin ymmärtäminen, puhuminen",
      "examLanguageSV",
      "finska"
    );
  }

  private void assertCommonEnrollmentConfirmationEmailContent(final String emailContent) {
    assertNotNull(emailContent);
    assertTrue(emailContent.contains("<html "));
    assertTrue(emailContent.contains("suomi"));
    assertTrue(emailContent.contains("erinomainen"));
    assertTrue(emailContent.contains("10.06.2023"));
    assertTrue(emailContent.contains("kirjallinen taito, suullinen taito"));
    assertTrue(emailContent.contains("kirjoittaminen, tekstin ymmärtäminen, puhuminen"));
    assertTrue(emailContent.contains("finska"));
  }
}
