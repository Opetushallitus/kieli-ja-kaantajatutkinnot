package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import fi.oph.vkt.util.DateUtil;
import fi.vm.sade.javautils.nio.cas.CasClient;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.time.LocalDate;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;

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

  Environment environment;

  private int personOidCounter = 0;

  @BeforeEach
  public void setup() {
    environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.register.url")).thenReturn("https://foo.bar");
  }

  @Test
  public void testSyncEnrollments() throws IOException, InterruptedException, ExecutionException {
    final ExamEvent examEvent1 = createExamEvent(2, LocalDate.of(2025, 5, 27));
    final ExamEvent examEvent2 = createExamEvent(2, LocalDate.of(2045, 5, 27));
    final ExaminerExamEvent examinerExamEvent = createExaminerExamEvent();
    final Enrollment enrollment1 = createEnrollment(examEvent1, EnrollmentStatus.COMPLETED);
    final Enrollment enrollment2 = createEnrollment(examEvent2, EnrollmentStatus.COMPLETED);
    final EnrollmentAppointment enrollmentAppointment1 = createEnrollmentAppointment(
      examinerExamEvent,
      EnrollmentAppointmentStatus.COMPLETED,
      true
    );
    final EnrollmentAppointment enrollmentAppointment2 = createEnrollmentAppointment(
      examinerExamEvent,
      EnrollmentAppointmentStatus.COMPLETED,
      false
    );

    final CasClient casClient = mock(CasClient.class);
    final Response response = mock(Response.class);

    when(response.getStatusCode()).thenReturn(HttpStatus.OK.value());
    when(response.getResponseBody()).thenReturn(getMockSyncResponse());
    when(casClient.executeBlocking(any())).thenReturn(response);

    assertNull(enrollment1.getLastSyncAt());
    assertNull(enrollment2.getLastSyncAt());
    assertNull(enrollmentAppointment1.getLastSyncAt());
    assertNull(enrollmentAppointment2.getLastSyncAt());

    final RegisterEnrollmentService registerEnrollmentService = new RegisterEnrollmentService(
      casClient,
      enrollmentRepository,
      enrollmentAppointmentRepository,
      environment
    );
    registerEnrollmentService.sync();

    verify(casClient, times(1))
      .executeBlocking(
        argThat(r -> {
          final String actual = r.getStringData();
          final String expected1 = getMockSyncRequest1().replace("[id]", "ET-" + enrollment1.getId()).trim();

          return (
            actual != null &&
            actual.trim().equals(expected1) &&
            r.getUrl().equals("https://foo.bar") &&
            r.getMethod().equals("PUT") &&
            r.getHeaders().get("Content-Type").equals("application/json")
          );
        })
      );
    verify(casClient, times(1))
      .executeBlocking(
        argThat(r -> {
          final String actual = r.getStringData();
          final String today = DateUtil.formatOptionalDate(LocalDate.now());
          final String expected2 = getMockSyncRequest2()
            .replace("[id]", "HTT-" + enrollmentAppointment1.getId())
            .replace("[date]", today)
            .trim();

          return (
            actual != null &&
            actual.trim().equals(expected2) &&
            r.getUrl().equals("https://foo.bar") &&
            r.getMethod().equals("PUT") &&
            r.getHeaders().get("Content-Type").equals("application/json")
          );
        })
      );
    verify(casClient, times(2)).executeBlocking(any());
    assertNotNull(enrollmentAppointment1.getLastSyncAt());
    assertNull(enrollmentAppointment2.getLastSyncAt());
    assertNotNull(enrollment1.getLastSyncAt());
    assertNull(enrollment2.getLastSyncAt());
  }

  private String getMockSyncRequest1() {
    try {
      return new String(syncRequest1.getInputStream().readAllBytes());
    } catch (final Exception e) {
      return "";
    }
  }

  private String getMockSyncRequest2() {
    try {
      return new String(syncRequest2.getInputStream().readAllBytes());
    } catch (final Exception e) {
      return "";
    }
  }

  private String getMockSyncResponse() throws IOException {
    return new String(syncResponse.getInputStream().readAllBytes());
  }

  private ExamEvent createExamEvent(final int maxParticipants, final LocalDate examDate) {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(maxParticipants);
    examEvent.setDate(examDate);
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
    final Person person = createPerson("1.2.246.562.10.123456789" + personOidCounter++);
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(status);
    entityManager.persist(enrollment);

    return enrollment;
  }

  private EnrollmentAppointment createEnrollmentAppointment(
    final ExaminerExamEvent examEvent,
    final EnrollmentAppointmentStatus status,
    final boolean hasGrades
  ) {
    final Person person = createPerson("2.2.246.562.10.123456789" + personOidCounter++);
    final Examiner examiner = examEvent.getExaminer();
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);
    enrollment.setStatus(status);

    if (hasGrades) {
      enrollment.setGrade(enrollmentGrade);
    }

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
