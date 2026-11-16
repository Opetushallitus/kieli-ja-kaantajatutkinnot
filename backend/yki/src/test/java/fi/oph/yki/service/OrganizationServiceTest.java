package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import okhttp3.mockwebserver.Dispatcher;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

class OrganizationServiceTest {

  // Bigger than a real organisation (5-9 KB), so that 70 organisations in one response are well over 256 KB.
  private static final String METADATA = "x".repeat(10 * 1024);

  private final ObjectMapper objectMapper = new ObjectMapper();
  private MockWebServer mockWebServer;
  private OrganizationService organizationService;

  @BeforeEach
  void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.setDispatcher(
      new Dispatcher() {
        @Override
        public MockResponse dispatch(final RecordedRequest request) {
          try {
            final List<String> oids = objectMapper.readValue(request.getBody().readUtf8(), new TypeReference<>() {});
            final List<Map<String, Object>> organizations = oids
              .stream()
              .map(oid -> Map.<String, Object>of("oid", oid, "nimi", Map.of("fi", "Nimi " + oid), "metadata", METADATA))
              .toList();

            return new MockResponse()
              .setResponseCode(200)
              .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
              .setBody(objectMapper.writeValueAsString(organizations));
          } catch (final IOException e) {
            return new MockResponse().setResponseCode(500);
          }
        }
      }
    );
    mockWebServer.start();
    final WebClient webClient = WebClient.builder().baseUrl("http://localhost:" + mockWebServer.getPort()).build();
    organizationService = new OrganizationService(objectMapper, webClient);
  }

  @AfterEach
  void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  void returnsEmptyMapWithoutRequestForEmptyInput() {
    assertEquals(Map.of(), organizationService.getOrganizationNames(List.of()));
    assertEquals(Map.of(), organizationService.getOrganizationNames(null));
    assertEquals(0, mockWebServer.getRequestCount());
  }

  @Test
  void returnsNamesWhenAllOrganizationsDoNotFitInOneResponse() throws InterruptedException {
    final List<String> oids = IntStream.rangeClosed(1, 70).mapToObj(i -> "1.2.246.562.10." + i).toList();

    final Map<String, String> names = organizationService.getOrganizationNames(oids);

    assertEquals(70, names.size());
    oids.forEach(oid -> assertEquals("Nimi " + oid, names.get(oid)));

    assertEquals(1, mockWebServer.getRequestCount());
    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals("/api/findbyoids", request.getPath());
  }
}
