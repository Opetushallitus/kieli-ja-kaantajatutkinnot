package fi.oph.vkt.service.email.sender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.service.email.EmailAttachmentData;
import fi.oph.vkt.service.email.EmailData;
import java.util.Base64;
import java.util.List;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.json.BasicJsonTester;
import org.springframework.boot.test.json.JsonContent;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

class EmailSenderViestintapalveluTest {

  private EmailSenderViestintapalvelu sender;

  private MockWebServer mockWebServer;

  private final BasicJsonTester json = new BasicJsonTester(this.getClass());

  @BeforeEach
  public void setup() {
    mockWebServer = new MockWebServer();
    final String mockWebServerBaseUrl = mockWebServer.url("/").url().toString();
    sender =
      new EmailSenderViestintapalvelu(
        WebClient.builder().baseUrl(mockWebServerBaseUrl).build(),
        "prosessi",
        "Sovellus"
      );
  }

  @Test
  public void test() throws JsonProcessingException, InterruptedException {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody("{\"id\":\"12345\"}")
    );

    final EmailData emailData = EmailData
      .builder()
      .recipientName("vastaanottaja")
      .recipientAddress("vastaanottaja@invalid")
      .subject("testiotsikko")
      .body("testiviesti")
      .attachments(List.of())
      .build();

    final String extId = sender.sendEmail(emailData);

    assertEquals("12345", extId);

    final RecordedRequest request = mockWebServer.takeRequest();
    final String source = request.getBody().readUtf8();
    final JsonContent<Object> body = json.from(source);

    assertThat(body).extractingJsonPathBooleanValue("$.email.html").isEqualTo(true);
    assertThat(body).extractingJsonPathStringValue("$.email.charset").isEqualTo("UTF-8");
    assertThat(body).extractingJsonPathStringValue("$.email.callingProcess").isEqualTo("prosessi");
    assertThat(body).extractingJsonPathStringValue("$.email.sender").isEqualTo("Sovellus");
    assertThat(body).extractingJsonPathStringValue("$.email.subject").isEqualTo("testiotsikko");
    assertThat(body).extractingJsonPathStringValue("$.email.body").isEqualTo("testiviesti");

    assertThat(body).extractingJsonPathArrayValue("$.recipient").size().isEqualTo(1);
    assertThat(body).extractingJsonPathStringValue("$.recipient[0].name").isEqualTo("vastaanottaja");
    assertThat(body).extractingJsonPathStringValue("$.recipient[0].email").isEqualTo("vastaanottaja@invalid");

    assertThat(body).hasEmptyJsonPathValue("$.email.attachments");
  }

  @Test
  public void testWithAttachments() throws JsonProcessingException, InterruptedException {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody("{\"id\":\"12345\"}")
    );

    final EmailAttachmentData attachmentData = EmailAttachmentData
      .builder()
      .data(new byte[] { 'a', 'b', 'c' })
      .contentType("foo/bar")
      .name("foo.bar")
      .build();
    final EmailData emailData = EmailData
      .builder()
      .recipientName("vastaanottaja")
      .recipientAddress("vastaanottaja@invalid")
      .subject("testiotsikko")
      .body("testiviesti")
      .attachments(List.of(attachmentData))
      .build();

    final String extId = sender.sendEmail(emailData);

    assertEquals("12345", extId);

    final RecordedRequest request = mockWebServer.takeRequest();
    final String source = request.getBody().readUtf8();
    final JsonContent<Object> body = json.from(source);

    assertThat(body).extractingJsonPathBooleanValue("$.email.html").isEqualTo(true);
    assertThat(body).extractingJsonPathStringValue("$.email.charset").isEqualTo("UTF-8");
    assertThat(body).extractingJsonPathStringValue("$.email.callingProcess").isEqualTo("prosessi");
    assertThat(body).extractingJsonPathStringValue("$.email.sender").isEqualTo("Sovellus");
    assertThat(body).extractingJsonPathStringValue("$.email.subject").isEqualTo("testiotsikko");
    assertThat(body).extractingJsonPathStringValue("$.email.body").isEqualTo("testiviesti");

    assertThat(body).extractingJsonPathArrayValue("$.recipient").size().isEqualTo(1);
    assertThat(body).extractingJsonPathStringValue("$.recipient[0].name").isEqualTo("vastaanottaja");
    assertThat(body).extractingJsonPathStringValue("$.recipient[0].email").isEqualTo("vastaanottaja@invalid");

    assertThat(body).extractingJsonPathArrayValue("$.email.attachments").size().isEqualTo(1);
    assertThat(body).extractingJsonPathStringValue("$.email.attachments[0].name").isEqualTo("foo.bar");
    assertThat(body).extractingJsonPathStringValue("$.email.attachments[0].contentType").isEqualTo("foo/bar");
    assertThat(body)
      .extractingJsonPathStringValue("$.email.attachments[0].data")
      .isEqualTo(new String(Base64.getEncoder().encode(new byte[] { 'a', 'b', 'c' })));
  }
}
