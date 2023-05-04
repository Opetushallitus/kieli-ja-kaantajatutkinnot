package fi.oph.vkt.service.auth.ticketValidator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.service.auth.CasTicketValidationService;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@DataJpaTest
public class TicketValidatorTest {

  @Value("classpath:auth/cas-response-fi.xml")
  private org.springframework.core.io.Resource casSuccessResponseFI;

  @Value("classpath:auth/cas-response-uk.xml")
  private org.springframework.core.io.Resource casSuccessResponseUK;

  private MockWebServer mockWebServer;
  private String casUrl;

  final String serviceUrl = "https://qwerty/login";
  final String ticket = "foobar";

  @BeforeEach
  public void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
    casUrl = String.format("http://localhost:%s", mockWebServer.getPort());
  }

  @AfterEach
  public void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  public void testValidateTicketFI() throws IOException, InterruptedException {
    Map<String, String> params = doRequest(getMockFIResponse());

    RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("GET", request.getMethod());
    assertEquals(serviceUrl, Objects.requireNonNull(request.getRequestUrl()).queryParameter("service"));
    assertEquals(ticket, Objects.requireNonNull(request.getRequestUrl()).queryParameter("ticket"));
    assertEquals("Tessa", params.get("firstName"));
    assertEquals("Testilä", params.get("lastName"));
    assertEquals("010280-952L", params.get("identityNumber"));
    assertEquals("1.2.246.562.24.40675408602", params.get("oid"));
  }

  @Test
  public void testValidateTicketUK() throws IOException, InterruptedException {
    Map<String, String> params = doRequest(getMockUKResponse());

    RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("GET", request.getMethod());
    assertEquals(serviceUrl, Objects.requireNonNull(request.getRequestUrl()).queryParameter("service"));
    assertEquals(ticket, Objects.requireNonNull(request.getRequestUrl()).queryParameter("ticket"));
    assertEquals("Oliver Jack", params.get("firstName"));
    assertEquals("Great Britain", params.get("lastName"));
    assertEquals("1981-02-04", params.get("dateOfBirth"));
    assertEquals(
      "UK/FI/Lorem0ipsum0dolor0sit0amet10consectetur0adipiscing0elit10sed0do0eiusmod0tempor0incididunt0ut0labore0et0dolore0magna0aliqua.0Ut0enim0ad0minim0veniam10quis0nostrud0exercitation0ullamco0laboris0nisi0ut0aliquip0ex0ea0commodo0consequat.0Duis0aute0irure0do",
      params.get("otherIdentifier")
    );
  }

  private Map<String, String> doRequest(final String response) {
    final WebClient webClient = WebClient.builder().baseUrl(casUrl).build();
    final Environment environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.cas-oppija.service-url")).thenReturn(serviceUrl);

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
        .setBody(response)
    );

    final TicketValidator casTicketValidator = new CasTicketValidator(environment, webClient);
    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(casTicketValidator);

    return casTicketValidationService.validate(ticket);
  }

  private String getMockUKResponse() throws IOException {
    return new String(casSuccessResponseUK.getInputStream().readAllBytes());
  }

  private String getMockFIResponse() throws IOException {
    return new String(casSuccessResponseFI.getInputStream().readAllBytes());
  }
}
