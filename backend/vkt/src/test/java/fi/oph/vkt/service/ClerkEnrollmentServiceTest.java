package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentLinkDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Arrays;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class ClerkEnrollmentServiceTest {

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private PaymentRepository paymentRepository;

  @MockBean
  private AuditService auditService;

  private ClerkEnrollmentService clerkEnrollmentService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.base-url.api")).thenReturn("http://localhost");

    final UUIDSource uuidSource = mock(UUIDSource.class);
    when(uuidSource.getRandomNonce()).thenReturn("269a2da4-58bb-45eb-b125-522b77e9167c");

    clerkEnrollmentService =
      new ClerkEnrollmentService(
        enrollmentRepository,
        examEventRepository,
        paymentRepository,
        auditService,
        environment,
        uuidSource
      );
  }

  @Test
  public void testUpdate() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ClerkEnrollmentUpdateDTO dto = createUpdateDTOAddingOne(enrollment);
    final ClerkEnrollmentDTO responseDTO = clerkEnrollmentService.update(dto);

    assertEquals(responseDTO.id(), dto.id());
    assertEquals(responseDTO.version(), dto.version() + 1);
    assertEquals(responseDTO.oralSkill(), dto.oralSkill());
    assertEquals(responseDTO.textualSkill(), dto.textualSkill());
    assertEquals(responseDTO.understandingSkill(), dto.understandingSkill());
    assertEquals(responseDTO.speakingPartialExam(), dto.speakingPartialExam());
    assertEquals(responseDTO.speechComprehensionPartialExam(), dto.speechComprehensionPartialExam());
    assertEquals(responseDTO.writingPartialExam(), dto.writingPartialExam());
    assertEquals(responseDTO.readingComprehensionPartialExam(), dto.readingComprehensionPartialExam());
    assertEquals(responseDTO.previousEnrollment(), dto.previousEnrollment());
    assertEquals(responseDTO.digitalCertificateConsent(), dto.digitalCertificateConsent());
    assertEquals(responseDTO.email(), dto.email());
    assertEquals(responseDTO.phoneNumber(), dto.phoneNumber());
    assertEquals(responseDTO.street(), dto.street());
    assertEquals(responseDTO.postalCode(), dto.postalCode());
    assertEquals(responseDTO.town(), dto.town());
    assertEquals(responseDTO.country(), dto.country());

    verify(auditService).logById(VktOperation.UPDATE_ENROLLMENT, enrollment.getId());
  }

  private ClerkEnrollmentUpdateDTO createUpdateDTOAddingOne(final Enrollment enrollment) {
    return ClerkEnrollmentUpdateDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .oralSkill(!enrollment.isOralSkill())
      .textualSkill(!enrollment.isTextualSkill())
      .understandingSkill(!enrollment.isUnderstandingSkill())
      .speakingPartialExam(!enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(!enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(!enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(!enrollment.isReadingComprehensionPartialExam())
      .previousEnrollment(enrollment.getPreviousEnrollment() != null ? enrollment.getPreviousEnrollment() + "X" : null)
      .digitalCertificateConsent(!enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail() + "x")
      .phoneNumber(enrollment.getPhoneNumber() + "X")
      .street(enrollment.getStreet() + "X")
      .postalCode(enrollment.getPostalCode() + "X")
      .town(enrollment.getTown() + "X")
      .country(enrollment.getCountry() + "X")
      .build();
  }

  @Test
  public void testStatusChanges() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(EnrollmentStatus.CANCELED);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final int originalVersion = enrollment.getVersion();
    final EnrollmentStatus[] statuses = EnrollmentStatus.values();

    Arrays
      .stream(statuses)
      .forEach(status -> {
        final ClerkEnrollmentDTO dto = clerkEnrollmentService.changeStatus(createStatusChangeDTO(enrollment, status));
        assertEquals(status, dto.status());
      });

    assertEquals(
      originalVersion + statuses.length,
      enrollmentRepository.getReferenceById(enrollment.getId()).getVersion()
    );

    verify(auditService, times(statuses.length)).logById(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId());
  }

  private static ClerkEnrollmentStatusChangeDTO createStatusChangeDTO(
    final Enrollment enrollment,
    final EnrollmentStatus newStatus
  ) {
    return ClerkEnrollmentStatusChangeDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .newStatus(newStatus)
      .build();
  }

  @Test
  public void testMove() {
    final ExamEvent examEvent = Factory.examEvent();
    final ExamEvent examEvent2 = Factory.examEvent();
    examEvent2.setDate(examEvent2.getDate().plusDays(1));
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(examEvent2);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final int originalEnrollmentVersion = enrollment.getVersion();

    final ClerkEnrollmentMoveDTO moveDTO = createMoveDTO(enrollment, examEvent2);
    final ClerkEnrollmentDTO responseDTO = clerkEnrollmentService.move(moveDTO);

    assertEquals(originalEnrollmentVersion + 1, responseDTO.version());
    assertEquals(examEvent2.getId(), enrollmentRepository.getReferenceById(enrollment.getId()).getExamEvent().getId());

    verify(auditService).logById(VktOperation.MOVE_ENROLLMENT, enrollment.getId());
  }

  @Test
  public void testMoveFailsIfLanguageMismatch() {
    final ExamEvent examEvent = Factory.examEvent();
    final ExamEvent examEvent2 = Factory.examEvent(ExamLanguage.SV);
    examEvent2.setDate(examEvent2.getDate().plusDays(1));
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(examEvent2);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ClerkEnrollmentMoveDTO moveDTO = createMoveDTO(enrollment, examEvent2);

    final APIException ex = assertThrows(APIException.class, () -> clerkEnrollmentService.move(moveDTO));

    assertEquals(APIExceptionType.ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testMoveFailsIfAlreadyEnrolledToMovedExamEvent() {
    final ExamEvent examEvent = Factory.examEvent();
    final ExamEvent examEvent2 = Factory.examEvent();
    examEvent2.setDate(examEvent2.getDate().plusDays(1));
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    final Enrollment enrollment2 = Factory.enrollment(examEvent2, person);

    entityManager.persist(examEvent);
    entityManager.persist(examEvent2);
    entityManager.persist(person);
    entityManager.persist(enrollment);
    entityManager.persist(enrollment2);

    final ClerkEnrollmentMoveDTO moveDTO = createMoveDTO(enrollment, examEvent2);

    final APIException ex = assertThrows(APIException.class, () -> clerkEnrollmentService.move(moveDTO));

    assertEquals(APIExceptionType.ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  private static ClerkEnrollmentMoveDTO createMoveDTO(final Enrollment enrollment, final ExamEvent event) {
    return ClerkEnrollmentMoveDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .toExamEventId(event.getId())
      .build();
  }

  @Test
  public void testCreatePaymentLink() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ClerkPaymentLinkDTO clerkPaymentLinkDTO = clerkEnrollmentService.createPaymentLink(enrollment.getId());
    final String expectedUrl = String.format(
      "http://localhost/examEvent/%d/redirect/269a2da4-58bb-45eb-b125-522b77e9167c",
      examEvent.getId()
    );

    assertEquals(expectedUrl, clerkPaymentLinkDTO.url());
    assertEquals("269a2da4-58bb-45eb-b125-522b77e9167c", enrollment.getPaymentLinkHash());
    assertTrue(enrollment.getPaymentLinkExpiresAt().isAfter(LocalDateTime.now()));
  }

  @Test
  public void testCancelUnfinishedEnrollmentOnSuccess() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    clerkEnrollmentService.cancelUnfinishedEnrollment(enrollment);

    assertEquals(
      EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT,
      enrollmentRepository.getReferenceById(enrollment.getId()).getStatus()
    );
  }

  @Test
  public void testCancelUnfinishedEnrollmentFailsIfEnrollmentHasCompleteStatus() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setStatus(EnrollmentStatus.QUEUED);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    assertThrows(AssertionError.class, () -> clerkEnrollmentService.cancelUnfinishedEnrollment(enrollment));
    assertEquals(EnrollmentStatus.QUEUED, enrollmentRepository.getReferenceById(enrollment.getId()).getStatus());
  }

  @Test
  public void testDeleteEnrollmentOnSuccess() {
    final ExamEvent examEvent = Factory.examEvent();
    entityManager.persist(examEvent);

    final Person person1 = Factory.person();
    final Enrollment enrollment1 = Factory.enrollment(examEvent, person1);
    entityManager.persist(person1);
    entityManager.persist(enrollment1);

    final Person person2 = Factory.person();
    final Enrollment enrollment2 = Factory.enrollment(examEvent, person2);
    entityManager.persist(person2);
    entityManager.persist(enrollment2);

    for (int i = 0; i < 2; i++) {
      final Payment payment = Factory.payment(enrollment1);
      payment.setPaymentStatus(PaymentStatus.FAIL);
      entityManager.persist(payment);
    }

    clerkEnrollmentService.deleteEnrollment(enrollment1);

    assertFalse(enrollmentRepository.existsById(enrollment1.getId()));
    assertTrue(enrollmentRepository.existsById(enrollment2.getId()));
    assertEquals(0, paymentRepository.count());
  }

  @Test
  public void testDeleteEnrollmentFailsIfEnrollmentHasPaidPayment() {
    final ExamEvent examEvent = Factory.examEvent();
    entityManager.persist(examEvent);

    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final Payment payment = Factory.payment(enrollment);
    payment.setPaymentStatus(PaymentStatus.OK);
    entityManager.persist(payment);

    assertThrows(AssertionError.class, () -> clerkEnrollmentService.deleteEnrollment(enrollment));
    assertTrue(enrollmentRepository.existsById(enrollment.getId()));
    assertTrue(paymentRepository.existsById(payment.getId()));
  }
}
