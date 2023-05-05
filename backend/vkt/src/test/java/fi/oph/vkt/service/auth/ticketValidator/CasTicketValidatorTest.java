package fi.oph.vkt.service.auth.ticketValidator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.service.auth.CasTicketValidationService;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
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
public class CasTicketValidatorTest {

  @Value("classpath:auth/cas-response-fi.xml")
  private org.springframework.core.io.Resource casSuccessResponseFI;

  @Value("classpath:auth/cas-response-uk.xml")
  private org.springframework.core.io.Resource casSuccessResponseUK;

  @Value("classpath:auth/cas-response-fail.xml")
  private org.springframework.core.io.Resource casFailResponse;

  private MockWebServer mockWebServer;
  private String casUrl;

  private final String serviceUrl = "https://qwerty/login";
  private final String ticket = "ST-313-JoKEv9YAhQqYSiK5bY3VKYEa7ks-ip-10-20-107-194";

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
    final Map<String, String> params = doRequest(getMockFIResponse());

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("GET", request.getMethod());
    assertEquals(serviceUrl, Objects.requireNonNull(request.getRequestUrl()).queryParameter("service"));
    assertEquals(ticket, Objects.requireNonNull(request.getRequestUrl()).queryParameter("ticket"));
    assertEquals("Tessa", params.get("firstName"));
    assertEquals("Testilä", params.get("lastName"));
    assertEquals("010280-952L", params.get("identityNumber"));
    assertEquals("1.2.246.562.24.40675408602", params.get("oid"));
    assertNull(params.get("dateOfBirth"));
    assertNull(params.get("otherIdentifier"));
  }

  @Test
  public void testValidateTicketUK() throws IOException, InterruptedException {
    final Map<String, String> params = doRequest(getMockUKResponse());

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("GET", request.getMethod());
    assertEquals(serviceUrl, Objects.requireNonNull(request.getRequestUrl()).queryParameter("service"));
    assertEquals(ticket, Objects.requireNonNull(request.getRequestUrl()).queryParameter("ticket"));
    assertNull(params.get("oid"));
    assertNull(params.get("identityNumber"));
    assertEquals("Oliver Jack", params.get("firstName"));
    assertEquals("Great Britain", params.get("lastName"));
    assertEquals("1981-02-04", params.get("dateOfBirth"));
    assertEquals(
      "UK/FI/Lorem0ipsum0dolor0sit0amet10consectetur0adipiscing0elit10sed0do0eiusmod0tempor0incididunt0ut0labore0et0dolore0magna0aliqua.0Ut0enim0ad0minim0veniam10quis0nostrud0exercitation0ullamco0laboris0nisi0ut0aliquip0ex0ea0commodo0consequat.0Duis0aute0irure0do",
      params.get("otherIdentifier")
    );
  }

  @Test
  public void testValidateTicketFail500() {
    final APIException ex = assertThrows(APIException.class, () -> doRequest(getMockFailResponse(), 500));
    assertEquals(APIExceptionType.TICKET_VALIDATION_ERROR, ex.getExceptionType());
  }

  @Test
  public void testValidateTicketFail200() {
    final APIException ex = assertThrows(APIException.class, () -> doRequest(getMockFailResponse(), 200));
    assertEquals(APIExceptionType.TICKET_VALIDATION_ERROR, ex.getExceptionType());
  }

  private Map<String, String> doRequest(final String response) {
    return doRequest(response, 200);
  }

  private Map<String, String> doRequest(final String response, final int responseCode) {
    final WebClient webClient = WebClient.builder().baseUrl(casUrl).build();
    final Environment environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.cas-oppija.service-url")).thenReturn(serviceUrl);

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(responseCode)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
        .setBody(response)
    );

    final TicketValidator casTicketValidator = new CasTicketValidator(environment, webClient);
    final CasTicketValidationService casTicketValidationService = new CasTicketValidationService(casTicketValidator);

    return casTicketValidationService.validate(ticket);
  }

  private String getMockFailResponse() throws IOException {
    return new String(casFailResponse.getInputStream().readAllBytes());
  }

  private String getMockUKResponse() throws IOException {
    return new String(casSuccessResponseUK.getInputStream().readAllBytes());
  }

  private String getMockFIResponse() throws IOException {
    return new String(casSuccessResponseFI.getInputStream().readAllBytes());
  }
}
