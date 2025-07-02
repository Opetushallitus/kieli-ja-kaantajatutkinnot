package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.vm.sade.javautils.nio.cas.CasClient;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Objects;
import java.util.concurrent.ExecutionException;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class RegisterEnrollmentServiceTest {

  @Value("classpath:register/sync-request1.json")
  private org.springframework.core.io.Resource syncRequest1;

  @Value("classpath:register/sync-request2.json")
  private org.springframework.core.io.Resource syncRequest2;

  @Value("classpath:register/sync-response.json")
  private org.springframework.core.io.Resource syncResponse;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private EnrollmentAppointmentRepository enrollmentAppointmentRepository;

  @Resource
  private TestEntityManager entityManager;

  private MockWebServer mockWebServer;
  private String koskiUrl;
  Environment environment;

  @BeforeEach
  public void setup() {
    environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.base-url.public")).thenReturn("https://foo.bar");
  }

  @AfterEach
  public void tearDown() throws IOException {
    mockWebServer.shutdown();
  }

  @Test
  public void testSyncEnrollments() throws IOException, InterruptedException, ExecutionException {
    final ExamEvent examEvent = createExamEvent(2);
    final ExaminerExamEvent examinerExamEvent = createExaminerExamEvent();
    final Enrollment enrollment = createEnrollment(examEvent, EnrollmentStatus.COMPLETED);
    final EnrollmentAppointment enrollmentAppointment = createEnrollmentAppointment(
      examinerExamEvent,
      EnrollmentAppointmentStatus.COMPLETED
    );

    final CasClient casClient = mock(CasClient.class);
    final Response response = mock(Response.class);

    when(casClient.executeBlocking(any())).thenReturn(response);

    final RegisterEnrollmentService registerEnrollmentService = new RegisterEnrollmentService(
            casClient,
            enrollmentRepository,
            enrollmentAppointmentRepository,
            environment
    );
    registerEnrollmentService.sync();

    final RecordedRequest request1 = mockWebServer.takeRequest();
    assertEquals("POST", request1.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request1.getRequestUrl()).toString());
    assertEquals(
      getMockSyncRequest1().replace("[id]", String.valueOf(enrollment.getId())).trim(),
      request1.getBody().readUtf8().trim()
    );

    final RecordedRequest request2 = mockWebServer.takeRequest();
    assertEquals("POST", request2.getMethod());
    assertEquals(koskiUrl + "/oid", Objects.requireNonNull(request2.getRequestUrl()).toString());
    assertEquals(
      getMockSyncRequest2().replace("[id]", String.valueOf(enrollmentAppointment.getId())).trim(),
      request2.getBody().readUtf8().trim()
    );
  }

  private void doRequest(final String response, final int responseCode) throws JsonProcessingException {
    final WebClient webClient = WebClient.builder().baseUrl(koskiUrl).build();
    final MockResponse mockResponse = new MockResponse()
      .setResponseCode(responseCode)
      .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
      .setBody(response);

    mockWebServer.enqueue(mockResponse);
    mockWebServer.enqueue(mockResponse);

  }

  private String getMockSyncRequest1() throws IOException {
    return new String(syncRequest1.getInputStream().readAllBytes());
  }

  private String getMockSyncRequest2() throws IOException {
    return new String(syncRequest2.getInputStream().readAllBytes());
  }

  private String getMockSyncResponse() throws IOException {
    return new String(syncResponse.getInputStream().readAllBytes());
  }

  private ExamEvent createExamEvent(final int maxParticipants) {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(maxParticipants);
    examEvent.setDate(LocalDate.of(2025, 5, 27));
    entityManager.persist(examEvent);

    return examEvent;
  }

  private ExaminerExamEvent createExaminerExamEvent() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    examEvent.setDate(LocalDate.of(2025, 5, 27));
    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);

    return examEvent;
  }

  private Enrollment createEnrollment(final ExamEvent examEvent, final EnrollmentStatus status) {
    final Person person = createPerson("1.2.246.562.10.1234567890");
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(enrollment);

    return enrollment;
  }

  private EnrollmentAppointment createEnrollmentAppointment(
    final ExaminerExamEvent examEvent,
    final EnrollmentAppointmentStatus status
  ) {
    final Person person = createPerson("2.2.246.562.10.1234567890");
    final Examiner examiner = examEvent.getExaminer();
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);
    enrollment.setStatus(status);
    enrollment.setGrade(enrollmentGrade);
    entityManager.persist(enrollmentGrade);
    entityManager.persist(enrollment);

    return enrollment;
  }

  private Person createPerson(final String oid) {
    final Person person = Factory.person();
    person.setOid(oid);
    entityManager.persist(person);

    return person;
  }
}
