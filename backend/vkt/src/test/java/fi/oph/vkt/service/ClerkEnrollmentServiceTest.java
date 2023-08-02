package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
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
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.repository.PersonRepository;
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

  @Resource
  private PersonRepository personRepository;

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
        personRepository,
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
  public void testAnonymizeEnrollments() {
    final ExamEvent examEvent1 = Factory.examEvent(ExamLanguage.FI);
    final ExamEvent examEvent2 = Factory.examEvent(ExamLanguage.SV);
    entityManager.persist(examEvent1);
    entityManager.persist(examEvent2);

    final Person person1 = Factory.person();
    final Person person2 = Factory.person();
    final Person person3 = Factory.person();
    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(person3);

    final LocalDateTime sixMonthsAgo = LocalDateTime.now().minusDays(180);

    final Enrollment enrollment11 = createEnrollment(person1, examEvent1, sixMonthsAgo.minusDays(1), true);
    final Enrollment enrollment21 = createEnrollment(person2, examEvent1, sixMonthsAgo.minusMinutes(5), false);
    final Enrollment enrollment22 = createEnrollment(person2, examEvent2, sixMonthsAgo.plusMinutes(5), false);
    final Enrollment enrollment31 = createEnrollment(person3, examEvent1, sixMonthsAgo.plusDays(1), false);

    clerkEnrollmentService.anonymizeEnrollments();
    clerkEnrollmentService.anonymizeEnrollments(); // ensure second run doesn't cause side effects

    final int personVersion = 0;
    final int enrollmentVersion = 1;

    assertAnonymizedEnrollment(enrollment11, enrollmentVersion + 1, true);
    assertAnonymizedPerson(person1, personVersion + 1);

    assertAnonymizedEnrollment(enrollment21, enrollmentVersion + 1, false);
    assertNotAnonymizedEnrollment(enrollment22, enrollmentVersion);
    assertNotAnonymizedPerson(person2, personVersion);

    assertNotAnonymizedEnrollment(enrollment31, enrollmentVersion);
    assertNotAnonymizedPerson(person3, personVersion);
  }

  private Enrollment createEnrollment(
    final Person person,
    final ExamEvent examEvent,
    final LocalDateTime createdAt,
    final boolean includeAddress
  ) {
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    if (includeAddress) {
      enrollment.setStreet("5300 NEVELS AVE");
      enrollment.setPostalCode("35022-6186");
      enrollment.setTown("BESSEMER AL");
      enrollment.setCountry("USA");
    }
    entityManager.persist(enrollment);
    enrollment.setCreatedAt(createdAt);
    entityManager.merge(enrollment);

    return enrollment;
  }

  private void assertAnonymizedEnrollment(
    final Enrollment enrollment,
    final int expectedVersion,
    final boolean expectAddressToExist
  ) {
    assertEquals(expectedVersion, enrollment.getVersion());
    assertTrue(enrollment.isAnonymized());

    assertEquals("anonymisoitu.ilmoittautuja@vkt.vkt", enrollment.getEmail());
    assertEquals("+0000000", enrollment.getPhoneNumber());

    if (expectAddressToExist) {
      assertEquals("Testitie 1", enrollment.getStreet());
      assertEquals("00000", enrollment.getPostalCode());
      assertEquals("Kaupunki", enrollment.getTown());
      assertEquals("Maa", enrollment.getCountry());
    } else {
      assertNull(enrollment.getStreet());
      assertNull(enrollment.getPostalCode());
      assertNull(enrollment.getTown());
      assertNull(enrollment.getCountry());
    }
  }

  private void assertNotAnonymizedEnrollment(final Enrollment enrollment, final int expectedVersion) {
    final Enrollment defaultEnrollment = Factory.enrollment(Factory.examEvent(), Factory.person());

    assertEquals(expectedVersion, enrollment.getVersion());
    assertEquals(defaultEnrollment.getEmail(), enrollment.getEmail());
    assertEquals(defaultEnrollment.getPhoneNumber(), enrollment.getPhoneNumber());
    assertFalse(enrollment.isAnonymized());
  }

  private void assertAnonymizedPerson(final Person person, final int expectedVersion) {
    assertEquals(expectedVersion, person.getVersion());
    assertEquals("Ilmoittautuja", person.getLastName());
    assertEquals("Anonymisoitu", person.getFirstName());
  }

  private void assertNotAnonymizedPerson(final Person person, final int expectedVersion) {
    final Person defaultPerson = Factory.person();

    assertEquals(expectedVersion, person.getVersion());
    assertEquals(defaultPerson.getLastName(), person.getLastName());
    assertEquals(defaultPerson.getFirstName(), person.getFirstName());
  }
}
