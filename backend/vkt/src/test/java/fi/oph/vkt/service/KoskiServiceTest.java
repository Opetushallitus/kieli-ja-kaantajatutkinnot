package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.repository.KoskiEducationsRepository;
import fi.oph.vkt.service.koski.KoskiService;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class KoskiServiceTest {

  @Value("classpath:koski/koski-korkeakoulu-response.json")
  private org.springframework.core.io.Resource koskiKorkeakouluResponse;

  @Value("classpath:koski/koski-nordea-demo-response.json")
  private org.springframework.core.io.Resource koskiNordeaDemoResponse;

  @Value("classpath:koski/koski-combined-response.json")
  private org.springframework.core.io.Resource koskiCombinedResponse;

  private MockWebServer mockWebServer;
  private String koskiUrl;

  @Resource
  private KoskiEducationsRepository koskiEducationsRepository;

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

  @Test
  public void testFetchKoskiNordeaDemo() throws IOException, InterruptedException {
    final List<PublicEducationDTO> educations = doRequest(getMockNordeaDemoResponse(), "1.2.246.562.24.37998958910");

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request.getRequestUrl()).toString());
    assertEquals("{\"oid\":\"1.2.246.562.24.37998958910\"}", request.getBody().readUtf8());
    assertEquals(1, educations.size());
  }

  @Test
  public void testFetchKoskiCombined() throws IOException, InterruptedException {
    final List<PublicEducationDTO> educations = doRequest(getMockCombinedResponse(), "1.2.246.562.24.37998958910");

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request.getRequestUrl()).toString());
    assertEquals("{\"oid\":\"1.2.246.562.24.37998958910\"}", request.getBody().readUtf8());
    assertEquals(4, educations.size());
  }

  @Test
  public void testFetchKoskiRetry() throws IOException, InterruptedException {
    final WebClient webClient = WebClient.builder().baseUrl(koskiUrl).build();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(503)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(
          "[{\"key\":\"unavailable.virta\",\"message\":\"Korkeakoulutuksen opiskeluoikeuksia ei juuri nyt saada haettua. Yritä myöhemmin uudelleen.\"}]"
        )
    );
    final String response = getMockKorkeakouluResponse();
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(response)
    );

    final KoskiService koskiService = new KoskiService(webClient, koskiEducationsRepository);
    final List<PublicEducationDTO> educations = koskiService.findEducations("1.2.246.562.24.97984579806");

    final RecordedRequest failingRequest = mockWebServer.takeRequest();
    assertEquals("POST", failingRequest.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(failingRequest.getRequestUrl()).toString());

    final RecordedRequest retryRequest = mockWebServer.takeRequest();
    assertEquals("POST", retryRequest.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(retryRequest.getRequestUrl()).toString());
    assertEquals("{\"oid\":\"1.2.246.562.24.97984579806\"}", retryRequest.getBody().readUtf8());
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
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(response)
    );

    final KoskiService koskiService = new KoskiService(webClient, koskiEducationsRepository);

    return koskiService.findEducations(oid);
  }

  private String getMockCombinedResponse() throws IOException {
    return new String(koskiCombinedResponse.getInputStream().readAllBytes());
  }

  private String getMockKorkeakouluResponse() throws IOException {
    return new String(koskiKorkeakouluResponse.getInputStream().readAllBytes());
  }

  private String getMockNordeaDemoResponse() throws IOException {
    return new String(koskiNordeaDemoResponse.getInputStream().readAllBytes());
  }
}
