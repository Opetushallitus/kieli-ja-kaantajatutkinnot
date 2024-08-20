package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.service.koski.KoskiService;
import java.io.IOException;
import java.util.List;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class KoskiServiceTest {

  @Value("classpath:koski/koski-korkeakoulu-response.json")
  private org.springframework.core.io.Resource koskiKorkeakouluResponse;

  private MockWebServer mockWebServer;
  private String koskiUrl;

  @BeforeEach
  public void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
    koskiUrl = String.format("http://localhost:%s", mockWebServer.getPort());
  }

  @AfterEach
  public void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  public void testFetchKoskiYlioppilas() throws IOException, InterruptedException {
    final List<PublicEducationDTO> educations = doRequest(getMockKorkeakouluResponse(), "1.2.246.562.24.97984579806");

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request.getRequestUrl()).toString());
    assertEquals("{\"oid\":\"1.2.246.562.24.97984579806\"}", request.getBody().readUtf8());
    assertEquals(1, educations.size());
  }

  private List<PublicEducationDTO> doRequest(final String response, final String oid) {
    return doRequest(response, oid, 200);
  }

  private List<PublicEducationDTO> doRequest(final String response, final String oid, final int responseCode) {
    final WebClient webClient = WebClient.builder().baseUrl(koskiUrl).build();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(responseCode)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
        .setBody(response)
    );

    final KoskiService koskiService = new KoskiService(webClient);

    return koskiService.findEducations(oid);
  }

  private String getMockKorkeakouluResponse() throws IOException {
    return new String(koskiKorkeakouluResponse.getInputStream().readAllBytes());
  }
}
