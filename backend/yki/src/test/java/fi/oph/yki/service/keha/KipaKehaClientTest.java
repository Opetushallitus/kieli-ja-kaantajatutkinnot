package fi.oph.yki.service.keha;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

public class KipaKehaClientTest {

  private static final String SSN = "010170-999R";
  private static final UUID PERSON_UUID = UUID.fromString("6f1c2a52-7d0e-4f7e-9a51-3b8f3c1d2e4a");
  private static final UUID CORRELATION_ID = UUID.fromString("0b6d8a1e-2c3f-4b5a-8e9d-1f2a3b4c5d6e");

  private MockWebServer mockWebServer;
  private KipaKehaClient client;

  @BeforeEach
  public void setup() throws IOException {
    mockWebServer = new MockWebServer();
    mockWebServer.start();
    final WebClient webClient = WebClient
      .builder()
      .baseUrl(String.format("http://localhost:%s", mockWebServer.getPort()))
      .build();
    client = new KipaKehaClient(webClient, () -> "test-token", Duration.ofMillis(500));
  }

  @AfterEach
  public void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  public void testEligible() throws InterruptedException {
    enqueueJson(200, "{\"ykiTutkintoOikeus\":true,\"virhe\":null}");

    assertEquals(KehaDecision.ELIGIBLE, check());

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals("/v1/yki", request.getPath());
    assertEquals("Bearer test-token", request.getHeader(HttpHeaders.AUTHORIZATION));
    assertEquals(CORRELATION_ID.toString(), request.getHeader(KipaKehaClient.CORRELATION_ID_HEADER));
    final String body = request.getBody().readUtf8();
    assertTrue(body.contains("\"hetu\":\"" + SSN + "\""));
    assertTrue(body.contains("\"kayttajaTunniste\":\"" + PERSON_UUID + "\""));
  }

  @Test
  public void testNotEligible() {
    enqueueJson(200, "{\"ykiTutkintoOikeus\":false}");

    assertEquals(KehaDecision.NOT_ELIGIBLE, check());
  }

  @Test
  public void testPersonNotFoundIsNotEligible() {
    enqueueJson(404, "{\"virhe\":\"Henkilöä ei löytynyt\"}");

    assertEquals(KehaDecision.NOT_ELIGIBLE, check());
    assertEquals(1, mockWebServer.getRequestCount());
  }

  @Test
  public void testNoDecisionIsError() {
    enqueueJson(200, "{\"ykiTutkintoOikeus\":null,\"virhe\":\"Tietoja ei saatu\"}");

    assertError("no decision", 1);
  }

  @Test
  public void testEmptyBodyIsError() {
    mockWebServer.enqueue(new MockResponse().setResponseCode(200));

    assertError("no decision", 1);
  }

  @Test
  public void testInvalidBodyIsError() {
    enqueueJson(200, "not json");

    assertError("invalid response", 1);
  }

  @Test
  public void testClientErrorIsNotRetried() {
    enqueueJson(400, "{\"virhe\":\"Virheellinen pyyntö\"}");

    assertError("HTTP 400", 1);
  }

  @Test
  public void testUnauthorisedIsNotRetried() {
    enqueueJson(401, "{}");

    assertError("HTTP 401", 1);
  }

  @Test
  public void testServerErrorIsRetried() {
    enqueueJson(503, "{}");
    enqueueJson(200, "{\"ykiTutkintoOikeus\":true}");

    assertEquals(KehaDecision.ELIGIBLE, check());
    assertEquals(2, mockWebServer.getRequestCount());
  }

  @Test
  public void testServerErrorAfterRetries() {
    enqueueJson(500, "{}");
    enqueueJson(503, "{}");

    assertError("HTTP 503", 2);
  }

  @Test
  public void testTimeoutIsRetried() {
    mockWebServer.enqueue(new MockResponse().setResponseCode(200).setHeadersDelay(2, TimeUnit.SECONDS).setBody("{}"));
    enqueueJson(200, "{\"ykiTutkintoOikeus\":false}");

    assertEquals(KehaDecision.NOT_ELIGIBLE, check());
    assertEquals(2, mockWebServer.getRequestCount());
  }

  @Test
  public void testTimeoutAfterRetries() {
    for (int i = 0; i < 2; i++) {
      mockWebServer.enqueue(new MockResponse().setResponseCode(200).setHeadersDelay(2, TimeUnit.SECONDS).setBody("{}"));
    }

    assertError("timeout", 2);
  }

  @Test
  public void testConnectionFailure() throws IOException {
    mockWebServer.shutdown();

    final KehaException exception = assertThrows(KehaException.class, this::check);

    assertEquals("connection failed", exception.getMessage());
  }

  @Test
  public void testErrorDetailHasNoSsn() {
    enqueueJson(400, "{\"virhe\":\"Virheellinen hetu " + SSN + "\"}");

    final KehaException exception = assertThrows(KehaException.class, this::check);

    assertFalse(exception.getMessage().contains(SSN));
  }

  private KehaDecision check() {
    return client.checkEligibility(SSN, PERSON_UUID, CORRELATION_ID);
  }

  private void assertError(final String detail, final int expectedRequests) {
    final KehaException exception = assertThrows(KehaException.class, this::check);

    assertEquals(detail, exception.getMessage());
    assertEquals(expectedRequests, mockWebServer.getRequestCount());
  }

  private void enqueueJson(final int status, final String body) {
    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(status)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(body)
    );
  }
}
