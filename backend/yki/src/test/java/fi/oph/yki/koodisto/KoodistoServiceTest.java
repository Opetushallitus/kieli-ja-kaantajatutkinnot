package fi.oph.yki.koodisto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

class KoodistoServiceTest {

  private MockWebServer mockWebServer;
  private KoodistoService koodistoService;

  @BeforeEach
  void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
    final WebClient webClient = WebClient.builder().baseUrl("http://localhost:" + mockWebServer.getPort()).build();
    koodistoService = new KoodistoService(new ObjectMapper(), webClient);
  }

  @AfterEach
  void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  void returnsNullForBlankInput() {
    assertNull(koodistoService.getConvertedCountryCode(null));
    assertNull(koodistoService.getConvertedCountryCode(""));
    assertEquals(0, mockWebServer.getRequestCount());
  }

  @Test
  void convertsCountryCodeUsingRinnasteinenRelation() throws InterruptedException {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(
          """
          [
            {"koodiArvo": "246", "koodisto": {"koodistoUri": "maatjavaltiot2"}},
            {"koodiArvo": "FIN", "koodisto": {"koodistoUri": "maatjavaltiot1"}}
          ]
          """
        )
    );

    final String result = koodistoService.getConvertedCountryCode("246");

    assertEquals("FIN", result);
    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("/rest/json/relaatio/rinnasteinen/maatjavaltiot2_246", Objects.requireNonNull(request.getPath()));
  }

  @Test
  void returnsNullWhenNoMatchingRelationFound() {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody("[]")
    );

    assertNull(koodistoService.getConvertedCountryCode("246"));
  }

  @Test
  void returnsNullOn404() {
    mockWebServer.enqueue(new MockResponse().setResponseCode(404));

    assertNull(koodistoService.getConvertedCountryCode("246"));
  }
}
