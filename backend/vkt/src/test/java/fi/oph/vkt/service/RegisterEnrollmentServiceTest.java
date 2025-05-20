package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class RegisterEnrollmentServiceTest {

  @Value("classpath:register/sync-request.json")
  private org.springframework.core.io.Resource syncRequest;

  @Value("classpath:register/sync-response.json")
  private org.springframework.core.io.Resource syncResponse;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private TestEntityManager entityManager;

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
  public void testSyncEnrollments() throws IOException, InterruptedException {
    final ExamEvent examEvent = createExamEvent(2);
    createEnrollment(examEvent, EnrollmentStatus.COMPLETED);

    doRequest(getMockSyncResponse(), 200);

    final RecordedRequest request = mockWebServer.takeRequest();
    assertEquals("POST", request.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request.getRequestUrl()).toString());
    assertEquals(getMockSyncRequest().trim(), request.getBody().readUtf8().trim());
  }

  private void doRequest(final String response, final int responseCode) throws JsonProcessingException {
    final WebClient webClient = WebClient.builder().baseUrl(koskiUrl).build();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(responseCode)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(response)
    );

    final RegisterEnrollmentService registerEnrollmentService = new RegisterEnrollmentService(
      webClient,
      enrollmentRepository
    );
    registerEnrollmentService.sync();
  }

  private String getMockSyncRequest() throws IOException {
    return new String(syncRequest.getInputStream().readAllBytes());
  }

  private String getMockSyncResponse() throws IOException {
    return new String(syncResponse.getInputStream().readAllBytes());
  }

  private ExamEvent createExamEvent(final int maxParticipants) {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(maxParticipants);
    entityManager.persist(examEvent);

    return examEvent;
  }

  private Enrollment createEnrollment(final ExamEvent examEvent, final EnrollmentStatus status) {
    final Person person = createPerson();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(enrollment);

    return enrollment;
  }

  private Person createPerson() {
    final Person person = Factory.person();
    person.setOid("4ab2d4e4-58eb-4cbb-b176-98113eed06f4");
    entityManager.persist(person);

    return person;
  }
}
