package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.config.CacheConfig;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@SpringJUnitConfig(
  classes = { CacheConfig.class, KoodistoService.class, KoodistoServiceTest.KoodistoClientConfig.class }
)
public class KoodistoServiceTest {

  private static MockWebServer mockWebServer;

  @Configuration
  static class KoodistoClientConfig {

    @Bean
    public WebClient koodistoClient() {
      var port = mockWebServer.getPort();
      return WebClient.builder().baseUrl(String.format("http://localhost:%s", port)).build();
    }
  }

  @Value("classpath:koodisto/maatjavaltiot2-response.json")
  private org.springframework.core.io.Resource maatjavaltiot2Response;

  @Resource
  private KoodistoService koodistoService;

  @Resource
  private CacheManager cacheManager;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeAll
  public static void startServer() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
  }

  @AfterAll
  public static void stopServer() throws IOException {
    mockWebServer.shutdown();
  }

  @BeforeEach
  public void clearCache() {
    Objects.requireNonNull(cacheManager.getCache(CacheConfig.KOODISTO_CACHE)).clear();
  }

  @Test
  public void testMaatjavalitot2Works() throws IOException, InterruptedException {
    final String body = getMaatjavaltiot2Response();
    enqueue(200, body);

    final JsonNode codes = koodistoService.getCodes("maatjavaltiot2");

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("GET", request.getMethod());
    assertEquals("/rest/json/maatjavaltiot2/koodi?onlyValidKoodis=true", request.getPath());
    assertEquals(objectMapper.readTree(body), codes);
  }

  @Test
  public void testMaatjavalitot2CacheWorks() throws IOException, InterruptedException {
    final int requestsBefore = mockWebServer.getRequestCount();
    enqueue(200, getMaatjavaltiot2Response());
    enqueue(200, "[]");

    final JsonNode first = koodistoService.getCodes("maatjavaltiot2");
    final JsonNode second = koodistoService.getCodes("maatjavaltiot2");
    final JsonNode other = koodistoService.getCodes("kieli");

    assertEquals(first, second);
    assertEquals(0, other.size());
    assertEquals(2, mockWebServer.getRequestCount() - requestsBefore);
    assertEquals("/rest/json/maatjavaltiot2/koodi?onlyValidKoodis=true", mockWebServer.takeRequest().getPath());
    assertEquals("/rest/json/kieli/koodi?onlyValidKoodis=true", mockWebServer.takeRequest().getPath());
  }

  @Test
  public void testMaatjavalitot2ErrorIsThrown() throws InterruptedException {
    final int requestsBefore = mockWebServer.getRequestCount();
    enqueue(500, "");
    enqueue(500, "");

    assertThrows(WebClientResponseException.class, () -> koodistoService.getCodes("maatjavaltiot2"));
    assertThrows(WebClientResponseException.class, () -> koodistoService.getCodes("maatjavaltiot2"));

    assertEquals(2, mockWebServer.getRequestCount() - requestsBefore);
    mockWebServer.takeRequest();
    mockWebServer.takeRequest();
  }

  @Test
  public void testMaatjavalitot2EmptyThrows() throws InterruptedException {
    final int requestsBefore = mockWebServer.getRequestCount();
    enqueue(200, "");
    enqueue(200, "");

    assertThrows(RuntimeException.class, () -> koodistoService.getCodes("maatjavaltiot2"));
    assertThrows(RuntimeException.class, () -> koodistoService.getCodes("maatjavaltiot2"));

    assertEquals(2, mockWebServer.getRequestCount() - requestsBefore);
    mockWebServer.takeRequest();
    mockWebServer.takeRequest();
  }

  private void enqueue(final int status, final String body) {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(status)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(body)
    );
  }

  private String getMaatjavaltiot2Response() throws IOException {
    return new String(maatjavaltiot2Response.getInputStream().readAllBytes());
  }
}
