package fi.oph.akr.util;

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
  public void testAuthorisationExpiryTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderAuthorisationExpiryEmailBody(
      Map.of(
        "translatorName",
        "Jack Smith",
        "langPairFI",
        "englanti - ruotsi",
        "langPairSV",
        "engelska - svenska",
        "expiryDate",
        "06.02.2022",
        "meetingDate1",
        "13.12.2021",
        "meetingDate2",
        "14.03.2022"
      )
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("Jack Smith"));
    assertTrue(renderedContent.contains("englanti - ruotsi"));
    assertTrue(renderedContent.contains("engelska - svenska"));
    assertTrue(renderedContent.contains("06.02.2022"));
    assertTrue(renderedContent.contains("13.12.2021"));
  }

  @Test
  public void testContactRequestClerkTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderContactRequestClerkEmailBody(
      Map.of(
        "translators",
        List.of(Map.of("id", "1", "name", "Jack Smith")),
        "requesterName",
        "John Doe",
        "requesterEmail",
        "john.doe@unknown.invalid",
        "requesterPhone",
        "+358 400 888 777",
        "akrHost",
        "virkailija.opintopolku.fi"
      )
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("Jack Smith"));
    assertTrue(renderedContent.contains("https://virkailija.opintopolku.fi/akr/virkailija/kaantaja/1"));
    assertTrue(renderedContent.contains("John Doe"));
    assertTrue(renderedContent.contains("john.doe@unknown.invalid"));
    assertTrue(renderedContent.contains("+358 400 888 777"));
  }

  @Test
  public void testContactRequestRequesterTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderContactRequestRequesterEmailBody(
      Map.of(
        "translators",
        List.of("Jack Smith", "Mark Davis"),
        "requesterName",
        "John Doe",
        "requesterEmail",
        "john.doe@unknown.invalid",
        "requesterPhone",
        "+358 400 888 777",
        "messageLines",
        "This is the message."
      )
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("Jack Smith"));
    assertTrue(renderedContent.contains("Mark Davis"));
    assertTrue(renderedContent.contains("John Doe"));
    assertTrue(renderedContent.contains("john.doe@unknown.invalid"));
    assertTrue(renderedContent.contains("+358 400 888 777"));
    assertTrue(renderedContent.contains("This is the message."));
  }

  @Test
  public void testContactRequestTranslatorTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderContactRequestTranslatorEmailBody(
      Map.of(
        "requesterName",
        "John Doe",
        "requesterEmail",
        "john.doe@unknown.invalid",
        "requesterPhone",
        "+358 400 888 777",
        "messageLines",
        "This is the message."
      )
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<html "));
    assertTrue(renderedContent.contains("John Doe"));
    assertTrue(renderedContent.contains("john.doe@unknown.invalid"));
    assertTrue(renderedContent.contains("+358 400 888 777"));
    assertTrue(renderedContent.contains("This is the message."));
  }

  @Test
  public void testClerlkInformalEmailTemplateIsRendered() {
    final String renderedContent = templateRenderer.renderClerkInformalEmailBody(
      Map.of("messageLines", new String[] { "This is the message. Line 1", "Line 2" })
    );

    assertNotNull(renderedContent);
    assertTrue(renderedContent.contains("<span>This is the message. Line 1<br/></span><span>Line 2<br/></span>"));
  }
}
