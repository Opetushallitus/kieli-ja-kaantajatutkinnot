package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.ExamEventRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ClerkExamEventServiceTest {

  @Resource
  private ExamEventRepository examEventRepository;

  @MockBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private ClerkExamEventService clerkExamEventService;

  @BeforeEach
  public void setup() {
    clerkExamEventService = new ClerkExamEventService(examEventRepository, auditService);
  }

  @Test
  public void testListExamEvents() {
    final LocalDate now = LocalDate.now();

    final ExamEvent pastEvent = Factory.examEvent();
    pastEvent.setDate(now.minusWeeks(3));
    pastEvent.setRegistrationCloses(now.minusWeeks(4));

    final ExamEvent eventToday = Factory.examEvent(ExamLanguage.FI);
    eventToday.setDate(now);

    final ExamEvent eventWithRegistrationClosed = Factory.examEvent();
    eventWithRegistrationClosed.setDate(now.plusDays(3));
    eventWithRegistrationClosed.setRegistrationCloses(now.minusDays(1));

    final ExamEvent hiddenEvent = Factory.examEvent();
    hiddenEvent.setVisible(false);
    hiddenEvent.setDate(now.plusWeeks(1));

    final ExamEvent upcomingEventSv = Factory.examEvent(ExamLanguage.SV);
    final ExamEvent upcomingEventFi = Factory.examEvent(ExamLanguage.FI);

    final ExamEvent futureEvent = Factory.examEvent(ExamLanguage.FI);
    futureEvent.setDate(now.plusWeeks(3));
    futureEvent.setRegistrationCloses(now.plusWeeks(2));

    entityManager.persist(pastEvent);
    entityManager.persist(eventToday);
    entityManager.persist(eventWithRegistrationClosed);
    entityManager.persist(hiddenEvent);
    entityManager.persist(upcomingEventSv);
    entityManager.persist(upcomingEventFi);
    entityManager.persist(futureEvent);

    final List<ClerkExamEventListDTO> examEventListDTOs = clerkExamEventService.list();
    assertEquals(7, examEventListDTOs.size());

    final List<ExamEvent> expectedExamEventsOrdered = List.of(
      pastEvent,
      eventToday,
      eventWithRegistrationClosed,
      hiddenEvent,
      upcomingEventFi,
      upcomingEventSv,
      futureEvent
    );
    assertCorrectOrdering(expectedExamEventsOrdered, examEventListDTOs);

    IntStream
      .range(0, expectedExamEventsOrdered.size())
      .forEach(i -> {
        assertExamEventListDTODetails(expectedExamEventsOrdered.get(i), examEventListDTOs.get(i));

        final boolean expectedIsPublic = i == 1 || i >= 4;
        assertEquals(expectedIsPublic, examEventListDTOs.get(i).isPublic());
      });

    verify(auditService).logOperation(VktOperation.LIST_EXAM_EVENTS);
    verifyNoMoreInteractions(auditService);
  }

  private void assertCorrectOrdering(
    final List<ExamEvent> expectedExamEventsOrdered,
    final List<ClerkExamEventListDTO> examEventsListDTOs
  ) {
    final List<Long> expectedOrdering = expectedExamEventsOrdered.stream().map(ExamEvent::getId).toList();
    final List<Long> actualOrdering = examEventsListDTOs.stream().map(ClerkExamEventListDTO::id).toList();

    assertEquals(expectedOrdering, actualOrdering);
  }

  private void assertExamEventListDTODetails(final ExamEvent expected, final ClerkExamEventListDTO examEventListDTO) {
    assertEquals(expected.getId(), examEventListDTO.id());
    assertEquals(expected.getLanguage(), examEventListDTO.language());
    assertEquals(expected.getLevel(), examEventListDTO.level());
    assertEquals(expected.getDate(), examEventListDTO.date());
    assertEquals(expected.getRegistrationCloses(), examEventListDTO.registrationCloses());
    assertEquals(expected.getMaxParticipants(), examEventListDTO.maxParticipants());
  }

  @Test
  public void testGetExamEvent() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setMaxParticipants(1);

    final Person person1 = Factory.person();
    final Person person2 = Factory.person();
    final Enrollment enrollment1 = Factory.enrollment(examEvent, person1);
    final Enrollment enrollment2 = createEnrollmentWithNonDefaultAttributes(enrollment1, examEvent, person2);
    final ExamEvent otherExamEvent = Factory.examEvent(ExamLanguage.SV);
    final Enrollment otherEnrollment = Factory.enrollment(otherExamEvent, person1);

    entityManager.persist(examEvent);
    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(enrollment1);
    entityManager.persist(enrollment2);
    entityManager.persist(otherExamEvent);
    entityManager.persist(otherEnrollment);

    final ClerkExamEventDTO examEventDTO = clerkExamEventService.getExamEvent(examEvent.getId());
    assertEquals(examEvent.getId(), examEventDTO.id());
    assertEquals(examEvent.getVersion(), examEventDTO.version());
    assertEquals(examEvent.getLanguage(), examEventDTO.language());
    assertEquals(examEvent.getLevel(), examEventDTO.level());
    assertEquals(examEvent.getDate(), examEventDTO.date());
    assertEquals(examEvent.getRegistrationCloses(), examEventDTO.registrationCloses());
    assertEquals(examEvent.isVisible(), examEventDTO.isVisible());
    assertEquals(examEvent.getMaxParticipants(), examEventDTO.maxParticipants());

    assertEquals(2, examEventDTO.enrollments().size());
    assertEnrollmentDTO(enrollment1, examEventDTO.enrollments());
    assertEnrollmentDTO(enrollment2, examEventDTO.enrollments());

    verify(auditService).logById(VktOperation.GET_EXAM_EVENT, examEvent.getId());
    verifyNoMoreInteractions(auditService);
  }

  private Enrollment createEnrollmentWithNonDefaultAttributes(
    final Enrollment defaultEnrollment,
    final ExamEvent examEvent,
    final Person person
  ) {
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setOralSkill(!defaultEnrollment.isOralSkill());
    enrollment.setTextualSkill(!defaultEnrollment.isTextualSkill());
    enrollment.setUnderstandingSkill(!defaultEnrollment.isUnderstandingSkill());
    enrollment.setSpeakingPartialExam(!defaultEnrollment.isSpeakingPartialExam());
    enrollment.setSpeechComprehensionPartialExam(!defaultEnrollment.isSpeechComprehensionPartialExam());
    enrollment.setWritingPartialExam(!defaultEnrollment.isWritingPartialExam());
    enrollment.setReadingComprehensionPartialExam(!defaultEnrollment.isReadingComprehensionPartialExam());
    enrollment.setStatus(EnrollmentStatus.QUEUED);
    enrollment.setPreviousEnrollmentDate(null);
    enrollment.setDigitalCertificateConsent(!defaultEnrollment.isDigitalCertificateConsent());

    return enrollment;
  }

  private void assertEnrollmentDTO(final Enrollment expected, final List<ClerkEnrollmentDTO> enrollmentDTOs) {
    final ClerkEnrollmentDTO enrollmentDTO = enrollmentDTOs
      .stream()
      .filter(dto -> dto.id().equals(expected.getId()))
      .findAny()
      .get();
    final ClerkPersonDTO personDTO = enrollmentDTO.person();

    assertEquals(expected.getVersion(), enrollmentDTO.version());
    assertEquals(expected.isOralSkill(), enrollmentDTO.oralSkill());
    assertEquals(expected.isTextualSkill(), enrollmentDTO.textualSkill());
    assertEquals(expected.isUnderstandingSkill(), enrollmentDTO.understandingSkill());
    assertEquals(expected.isSpeakingPartialExam(), enrollmentDTO.speakingPartialExam());
    assertEquals(expected.isSpeechComprehensionPartialExam(), enrollmentDTO.speechComprehensionPartialExam());
    assertEquals(expected.isWritingPartialExam(), enrollmentDTO.writingPartialExam());
    assertEquals(expected.isReadingComprehensionPartialExam(), enrollmentDTO.readingComprehensionPartialExam());
    assertEquals(expected.getStatus(), enrollmentDTO.status());
    assertEquals(expected.getPreviousEnrollmentDate(), enrollmentDTO.previousEnrollmentDate());
    assertEquals(expected.isDigitalCertificateConsent(), enrollmentDTO.digitalCertificateConsent());

    // TODO: add more checks once ONR mock is integrated to the service
    assertEquals(expected.getPerson().getId(), personDTO.id());
    assertEquals(expected.getPerson().getVersion(), personDTO.version());

    assertEquals(0, enrollmentDTO.payments().size());
  }
}
