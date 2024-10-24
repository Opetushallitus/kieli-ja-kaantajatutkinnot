package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.FreeEnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
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
  private FreeEnrollmentRepository freeEnrollmentRepository;

  @Resource
  private ExamEventRepository examEventRepository;

  @Resource
  private PaymentRepository paymentRepository;

  @MockBean
  private AuditService auditService;

  private ClerkEnrollmentService clerkEnrollmentService;

  @Resource
  private TestEntityManager entityManager;

  @MockBean
  private KoskiService koskiService;

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
        uuidSource,
        freeEnrollmentRepository,
        koskiService
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

    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    final ClerkEnrollmentUpdateDTO dto = createUpdateDTOAddingOne(enrollment);
    final ClerkEnrollmentDTO responseDTO = clerkEnrollmentService.update(dto);
    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);

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

    verify(auditService).logUpdate(VktOperation.UPDATE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);
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

    verify(auditService, times(statuses.length))
      .logUpdate(
        eq(VktOperation.UPDATE_ENROLLMENT_STATUS),
        eq(enrollment.getId()),
        any(ClerkEnrollmentAuditDTO.class),
        any(ClerkEnrollmentAuditDTO.class)
      );
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

    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    final int originalEnrollmentVersion = enrollment.getVersion();

    final ClerkEnrollmentMoveDTO moveDTO = createMoveDTO(enrollment, examEvent2);
    final ClerkEnrollmentDTO responseDTO = clerkEnrollmentService.move(moveDTO);
    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);

    assertEquals(originalEnrollmentVersion + 1, responseDTO.version());
    assertEquals(examEvent2.getId(), enrollmentRepository.getReferenceById(enrollment.getId()).getExamEvent().getId());

    verify(auditService).logUpdate(VktOperation.MOVE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);
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

    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    final ClerkPaymentLinkDTO clerkPaymentLinkDTO = clerkEnrollmentService.createPaymentLink(enrollment.getId());
    final String expectedUrl = String.format(
      "http://localhost/examEvent/%d/redirect/269a2da4-58bb-45eb-b125-522b77e9167c",
      examEvent.getId()
    );
    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);

    assertEquals(expectedUrl, clerkPaymentLinkDTO.url());
    assertEquals("269a2da4-58bb-45eb-b125-522b77e9167c", enrollment.getPaymentLinkHash());
    assertTrue(enrollment.getPaymentLinkExpiresAt().isAfter(LocalDateTime.now()));

    verify(auditService)
      .logUpdate(VktOperation.UPDATE_ENROLLMENT_PAYMENT_LINK, enrollment.getId(), oldAuditDto, newAuditDto);
  }
}
