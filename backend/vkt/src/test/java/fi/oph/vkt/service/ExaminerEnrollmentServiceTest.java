package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentBirthdateOrSsnDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerOnrBirthdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentGradesRepository;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExaminerEnrollmentServiceTest {

  @Resource
  private EnrollmentAppointmentRepository enrollmentAppointmentRepository;

  @Resource
  private EnrollmentGradesRepository enrollmentGradesRepository;

  @Resource
  private ExaminerExamEventRepository examinerExamEventRepository;

  @MockBean
  private ExaminerEnrollmentEmailService examinerEnrollmentEmailService;

  @MockBean
  private AuditService auditService;

  @MockBean
  private OnrService onrService;

  @Resource
  private PersonRepository personRepository;

  @Resource
  private TestEntityManager entityManager;

  private ExaminerEnrollmentService examinerEnrollmentService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.base-url.api")).thenReturn("http://localhost");

    final UUIDSource uuidSource = mock(UUIDSource.class);
    when(uuidSource.getRandomNonce()).thenReturn("269a2da4-58bb-45eb-b125-522b77e9167c");

    examinerEnrollmentService =
      new ExaminerEnrollmentService(
        enrollmentAppointmentRepository,
        enrollmentGradesRepository,
        examinerExamEventRepository,
        environment,
        uuidSource,
        examinerEnrollmentEmailService,
        auditService,
        onrService,
        personRepository
      );
  }

  @Test
  public void testUpdate() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentAppointmentUpdateDTO dto = createUpdateDTOAddingOne(enrollment);
    final ExaminerEnrollmentAppointmentDTO responseDTO = examinerEnrollmentService.updateAppointment(
      examiner.getOid(),
      enrollment.getId(),
      dto
    );

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
    assertEquals(responseDTO.email(), dto.email());
    assertEquals(responseDTO.phoneNumber(), dto.phoneNumber());
    assertEquals(responseDTO.street(), dto.street());
    assertEquals(responseDTO.postalCode(), dto.postalCode());
    assertEquals(responseDTO.town(), dto.town());
    assertEquals(responseDTO.country(), dto.country());
  }

  @Test
  public void testUpdateOidMismatchThrows() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentAppointmentUpdateDTO dto = createUpdateDTOAddingOne(enrollment);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerEnrollmentService.updateAppointment("5.4.3.2.1", enrollment.getId(), dto)
    );

    assertEquals(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  private ExaminerEnrollmentAppointmentUpdateDTO createUpdateDTOAddingOne(final EnrollmentAppointment enrollment) {
    return ExaminerEnrollmentAppointmentUpdateDTO
      .builder()
      .id(enrollment.getId())
      .firstName("Irma")
      .lastName("Ilmoittautuja")
      .version(enrollment.getVersion())
      .oralSkill(!enrollment.isOralSkill())
      .textualSkill(!enrollment.isTextualSkill())
      .understandingSkill(!enrollment.isUnderstandingSkill())
      .speakingPartialExam(!enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(!enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(!enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(!enrollment.isReadingComprehensionPartialExam())
      .previousEnrollment(enrollment.getPreviousEnrollment() != null ? enrollment.getPreviousEnrollment() + "X" : null)
      .email(enrollment.getEmail() + "x")
      .phoneNumber(enrollment.getPhoneNumber() + "X")
      .street(enrollment.getStreet() + "X")
      .postalCode(enrollment.getPostalCode() + "X")
      .town(enrollment.getTown() + "X")
      .country(enrollment.getCountry() + "X")
      .hasPreviousEnrollment(true)
      .build();
  }

  @Test
  public void testGetAppointment() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentAppointmentDTO responseDTO = examinerEnrollmentService.getEnrollmentAppointment(
      examiner.getOid(),
      enrollment.getId()
    );

    assertEquals(responseDTO.id(), enrollment.getId());
    assertEquals(responseDTO.version(), enrollment.getVersion());
    assertEquals(responseDTO.oralSkill(), enrollment.isOralSkill());
    assertEquals(responseDTO.textualSkill(), enrollment.isTextualSkill());
    assertEquals(responseDTO.understandingSkill(), enrollment.isUnderstandingSkill());
    assertEquals(responseDTO.speakingPartialExam(), enrollment.isSpeakingPartialExam());
    assertEquals(responseDTO.speechComprehensionPartialExam(), enrollment.isSpeechComprehensionPartialExam());
    assertEquals(responseDTO.writingPartialExam(), enrollment.isWritingPartialExam());
    assertEquals(responseDTO.readingComprehensionPartialExam(), enrollment.isReadingComprehensionPartialExam());
    assertEquals(responseDTO.previousEnrollment(), enrollment.getPreviousEnrollment());
    assertEquals(responseDTO.email(), enrollment.getEmail());
    assertEquals(responseDTO.phoneNumber(), enrollment.getPhoneNumber());
    assertEquals(responseDTO.street(), enrollment.getStreet());
    assertEquals(responseDTO.postalCode(), enrollment.getPostalCode());
    assertEquals(responseDTO.town(), enrollment.getTown());
    assertEquals(responseDTO.country(), enrollment.getCountry());
    assertEquals(responseDTO.firstName(), enrollment.getFirstName());
    assertEquals(responseDTO.lastName(), enrollment.getLastName());
  }

  @Test
  public void testGetAppointmentOidMismatchThrows() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerEnrollmentService.getEnrollmentAppointment("5.4.3.2.1", enrollment.getId())
    );

    assertEquals(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testCancelAppointment() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    examinerEnrollmentService.cancelEnrollmentAppointment(examiner.getOid(), enrollment.getId());

    final EnrollmentAppointment enrollmentCanceled = enrollmentAppointmentRepository.getReferenceById(
      enrollment.getId()
    );

    assertEquals(EnrollmentAppointmentStatus.CANCELED, enrollmentCanceled.getStatus());
  }

  @Test
  public void testCancelAppointmentOidMismatchThrows() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerEnrollmentService.cancelEnrollmentAppointment("5.4.3.2.1", enrollment.getId())
    );

    assertEquals(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH, ex.getExceptionType());
    verifyNoInteractions(auditService);
  }

  @Test
  public void testGetAppointmentHistory() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent1 = Factory.examinerExamEvent(examiner, municipality);
    final ExaminerExamEvent examEvent2 = Factory.examinerExamEvent(examiner, municipality);
    final ExaminerExamEvent examEvent3 = Factory.examinerExamEvent(examiner, municipality);
    final ExaminerExamEvent examEvent4 = Factory.examinerExamEvent(examiner, municipality);
    final Person person1 = Factory.person();
    final Person person2 = Factory.person();
    final EnrollmentAppointment enrollment1 = Factory.enrollmentAppointment(examiner, examEvent1, person1);
    final EnrollmentAppointment enrollment2 = Factory.enrollmentAppointment(examiner, examEvent2, person1);
    final EnrollmentAppointment enrollment3 = Factory.enrollmentAppointment(examiner, examEvent3, person1);
    final EnrollmentAppointment enrollment4 = Factory.enrollmentAppointment(examiner, examEvent4, person2);

    enrollment2.setPreviousEnrollment("uniq1");
    enrollment3.setPreviousEnrollment("uniq2");

    enrollment2.setCreatedAt(LocalDateTime.now().minusDays(2));
    enrollment3.setCreatedAt(LocalDateTime.now().minusDays(5));

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent1);
    entityManager.persist(examEvent2);
    entityManager.persist(examEvent3);
    entityManager.persist(examEvent4);
    entityManager.persist(person1);
    entityManager.persist(person2);
    entityManager.persist(enrollment1);
    entityManager.persist(enrollment2);
    entityManager.persist(enrollment3);
    entityManager.persist(enrollment4);

    final List<ExaminerEnrollmentAppointmentHistoryDTO> history = examinerEnrollmentService.getEnrollmentAppointmentHistory(
      examiner.getOid(),
      enrollment1.getId()
    );

    assertEquals(2, history.size());
    assertEquals(examEvent3.getId(), history.get(0).examEvent().id());
    assertEquals(examEvent2.getId(), history.get(1).examEvent().id());
  }

  @Test
  public void testGetAppointmentGrades() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades(false);

    enrollment.setGrade(enrollmentGrade);

    entityManager.persist(enrollmentGrade);
    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentGradesDTO responseDTO = examinerEnrollmentService.getAppointmentGrades(
      examiner.getOid(),
      enrollment.getId()
    );

    assertEquals(EnrollmentGradeType.FAILED, responseDTO.writingPartialExam().grade());
    assertEquals("Writing comment", responseDTO.writingPartialExam().comment());

    assertEquals(EnrollmentGradeType.GOOD, responseDTO.speakingPartialExam().grade());
    assertEquals("Speaking comment", responseDTO.speakingPartialExam().comment());

    assertEquals(EnrollmentGradeType.SATISFACTORY, responseDTO.speechComprehensionPartialExam().grade());
    assertEquals("Speech comment", responseDTO.speechComprehensionPartialExam().comment());

    assertEquals(EnrollmentGradeType.FAILED, responseDTO.readingComprehensionPartialExam().grade());
    assertEquals("Reading comment", responseDTO.readingComprehensionPartialExam().comment());
  }

  @Test
  public void testGetAppointmentGradesOidMismatchThrows() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades(false);

    enrollment.setGrade(enrollmentGrade);

    entityManager.persist(enrollmentGrade);
    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerEnrollmentService.getAppointmentGrades("5.4.3.2.1", enrollment.getId())
    );
    assertEquals(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testUpsertAppointmentGrades() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final EnrollmentGradeDTO enrollmentGradeDTO1 = buildGrade(EnrollmentGradeType.SATISFACTORY, "Comment1");
    final EnrollmentGradeDTO enrollmentGradeDTO2 = buildGrade(EnrollmentGradeType.GOOD, "Comment2");
    final EnrollmentGradeDTO enrollmentGradeDTO3 = buildGrade(EnrollmentGradeType.FAILED, "Comment3");
    final EnrollmentGradeDTO enrollmentGradeDTO4 = buildGrade(EnrollmentGradeType.GOOD, "Comment4");

    final ExaminerEnrollmentGradesDTO examinerEnrollmentGradesDTO = ExaminerEnrollmentGradesDTO
      .builder()
      .readingComprehensionPartialExam(enrollmentGradeDTO1)
      .speakingPartialExam(enrollmentGradeDTO2)
      .writingPartialExam(enrollmentGradeDTO3)
      .speechComprehensionPartialExam(enrollmentGradeDTO4)
      .version(0)
      .build();

    final ExaminerEnrollmentGradesDTO responseDTO = examinerEnrollmentService.upsertAppointmentGrades(
      examiner.getOid(),
      enrollment.getId(),
      examinerEnrollmentGradesDTO
    );

    assertEquals(EnrollmentGradeType.SATISFACTORY, responseDTO.readingComprehensionPartialExam().grade());
    assertEquals("Comment1", responseDTO.readingComprehensionPartialExam().comment());
    assertEquals(EnrollmentGradeType.SATISFACTORY, enrollment.getGrade().getReadingComprehensionPartialExamGrade());
    assertEquals("Comment1", enrollment.getGrade().getReadingComprehensionPartialExamComment());

    assertEquals(EnrollmentGradeType.GOOD, responseDTO.speakingPartialExam().grade());
    assertEquals("Comment2", responseDTO.speakingPartialExam().comment());
    assertEquals(EnrollmentGradeType.GOOD, enrollment.getGrade().getSpeakingPartialExamGrade());
    assertEquals("Comment2", enrollment.getGrade().getSpeakingPartialExamComment());

    assertEquals(EnrollmentGradeType.FAILED, responseDTO.writingPartialExam().grade());
    assertEquals("Comment3", responseDTO.writingPartialExam().comment());
    assertEquals(EnrollmentGradeType.FAILED, enrollment.getGrade().getWritingPartialExamGrade());
    assertEquals("Comment3", enrollment.getGrade().getWritingPartialExamComment());

    assertEquals(EnrollmentGradeType.GOOD, responseDTO.speechComprehensionPartialExam().grade());
    assertEquals("Comment4", responseDTO.speechComprehensionPartialExam().comment());
    assertEquals(EnrollmentGradeType.GOOD, enrollment.getGrade().getSpeechComprehensionPartialExamGrade());
    assertEquals("Comment4", enrollment.getGrade().getSpeechComprehensionPartialExamComment());
  }

  @Test
  public void testUpsertOnlyOneAppointmentGrades() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final EnrollmentGradeDTO enrollmentGradeDTO1 = buildGrade(EnrollmentGradeType.SATISFACTORY, "Comment1");
    final ExaminerEnrollmentGradesDTO examinerEnrollmentGradesDTO = ExaminerEnrollmentGradesDTO
      .builder()
      .readingComprehensionPartialExam(enrollmentGradeDTO1)
      .version(0)
      .build();

    final ExaminerEnrollmentGradesDTO responseDTO = examinerEnrollmentService.upsertAppointmentGrades(
      examiner.getOid(),
      enrollment.getId(),
      examinerEnrollmentGradesDTO
    );

    assertEquals(EnrollmentGradeType.SATISFACTORY, responseDTO.readingComprehensionPartialExam().grade());
    assertEquals("Comment1", responseDTO.readingComprehensionPartialExam().comment());
    assertEquals(EnrollmentGradeType.SATISFACTORY, enrollment.getGrade().getReadingComprehensionPartialExamGrade());
    assertEquals("Comment1", enrollment.getGrade().getReadingComprehensionPartialExamComment());

    assertNull(responseDTO.speakingPartialExam());
    assertNull(enrollment.getGrade().getSpeakingPartialExamGrade());
    assertNull(enrollment.getGrade().getSpeakingPartialExamComment());

    assertNull(responseDTO.writingPartialExam());
    assertNull(enrollment.getGrade().getWritingPartialExamGrade());
    assertNull(enrollment.getGrade().getWritingPartialExamComment());

    assertNull(responseDTO.speechComprehensionPartialExam());
    assertNull(enrollment.getGrade().getSpeechComprehensionPartialExamGrade());
    assertNull(enrollment.getGrade().getSpeechComprehensionPartialExamComment());
  }

  private static EnrollmentGradeDTO buildGrade(final EnrollmentGradeType enrollmentGradeType, final String comment) {
    return EnrollmentGradeDTO.builder().grade(enrollmentGradeType).comment(comment).build();
  }

  @Test
  public void testGetContactRequest() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentContactRequestDTO responseDTO = examinerEnrollmentService.getEnrollmentContactRequest(
      examiner.getOid(),
      enrollment.getId()
    );

    assertEquals(responseDTO.id(), enrollment.getId());
    assertEquals(responseDTO.version(), enrollment.getVersion());
    assertEquals(responseDTO.email(), enrollment.getEmail());
    assertEquals(responseDTO.phoneNumber(), enrollment.getPhoneNumber());
    assertEquals(responseDTO.firstName(), enrollment.getFirstName());
    assertEquals(responseDTO.lastName(), enrollment.getLastName());
  }

  @Test
  public void testGetContactRequestOidMismatchThrows() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final APIException ex = assertThrows(
      APIException.class,
      () -> examinerEnrollmentService.getEnrollmentContactRequest("5.4.3.2.1", enrollment.getId())
    );
    assertEquals(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH, ex.getExceptionType());

    verifyNoInteractions(auditService);
  }

  @Test
  public void testGetContactRequestConvert() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ExaminerEnrollmentAppointmentDTO responseDTO = examinerEnrollmentService.convertToAppointment(
      examiner.getOid(),
      enrollment.getId(),
      new ExaminerEnrollmentExamEventDTO(examEvent.getId())
    );

    final EnrollmentAppointment enrollmentCreated = enrollmentAppointmentRepository.getReferenceById(
      enrollment.getId()
    );
    entityManager.refresh(enrollmentCreated);

    assertEquals(EnrollmentAppointmentStatus.ENROLLMENT_CREATED, enrollmentCreated.getStatus());
    assertEquals(examEvent.getId(), enrollmentCreated.getExaminerExamEvent().getId());
    assertNotNull(enrollmentCreated.getAuthHash());
    assertNull(enrollmentCreated.getPaymentLinkHash());

    assertEquals(responseDTO.id(), enrollmentCreated.getId());
    assertEquals(responseDTO.version(), enrollmentCreated.getVersion());
    assertEquals(responseDTO.email(), enrollmentCreated.getEmail());
    assertEquals(responseDTO.phoneNumber(), enrollmentCreated.getPhoneNumber());
    assertEquals(responseDTO.firstName(), enrollmentCreated.getFirstName());
    assertEquals(responseDTO.lastName(), enrollmentCreated.getLastName());
  }

  @Test
  public void testCreatePersonForAppointmentWithBirthdate() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);
    enrollment.setExaminerExamEvent(examEvent);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    final String onrOid = "1.2.3.4.5";
    final String birthdate = "12.2.2000";
    when(onrService.insertPersonalData(isA(Person.class), eq("2000-02-12"))).thenReturn(onrOid);

    final ExaminerEnrollmentBirthdateOrSsnDTO ssnDTO = ExaminerEnrollmentBirthdateOrSsnDTO
      .builder()
      .birthdateOrSsn(birthdate)
      .build();

    final ExaminerOnrBirthdateDTO onrBirthdateDTO = examinerEnrollmentService.createPersonForAppointment(
      examiner.getOid(),
      enrollment.getId(),
      ssnDTO
    );

    verify(onrService, Mockito.times(1)).insertPersonalData(any(), any());

    final EnrollmentAppointment enrollmentCreated = enrollmentAppointmentRepository.getReferenceById(
      enrollment.getId()
    );
    entityManager.refresh(enrollmentCreated);

    assertEquals(EnrollmentAppointmentStatus.CONTACT_CREATED, enrollmentCreated.getStatus());
    assertEquals(examEvent.getId(), enrollmentCreated.getExaminerExamEvent().getId());
    assertNull(enrollmentCreated.getAuthHash());
    assertNotNull(enrollmentCreated.getPaymentLinkHash());
    assertNotNull(enrollmentCreated.getPerson());
    assertEquals(enrollmentCreated.getFirstName(), enrollmentCreated.getPerson().getFirstName());
    assertEquals(enrollmentCreated.getLastName(), enrollmentCreated.getPerson().getLastName());
    assertEquals(enrollmentCreated.getPerson().getOid(), onrOid);
    assertEquals(onrOid, onrBirthdateDTO.oid());
    assertEquals(birthdate, onrBirthdateDTO.birthdate());
  }

  @Test
  public void testCreatePersonForAppointmentWithSSN() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);
    enrollment.setExaminerExamEvent(examEvent);

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    final String onrOid = "1.2.3.4.5";
    final String ssn = "210281-9988"; // Nordea demo SSN
    when(onrService.insertPersonalData(argThat(p -> p.getOtherIdentifier().equals(ssn)), isNull())).thenReturn(onrOid);

    final ExaminerEnrollmentBirthdateOrSsnDTO ssnDTO = ExaminerEnrollmentBirthdateOrSsnDTO
      .builder()
      .birthdateOrSsn(ssn)
      .build();

    final ExaminerOnrBirthdateDTO onrBirthdateDTO = examinerEnrollmentService.createPersonForAppointment(
      examiner.getOid(),
      enrollment.getId(),
      ssnDTO
    );

    verify(onrService, Mockito.times(1)).insertPersonalData(any(), any());

    final EnrollmentAppointment enrollmentCreated = enrollmentAppointmentRepository.getReferenceById(
      enrollment.getId()
    );
    entityManager.refresh(enrollmentCreated);

    assertEquals(EnrollmentAppointmentStatus.CONTACT_CREATED, enrollmentCreated.getStatus());
    assertEquals(examEvent.getId(), enrollmentCreated.getExaminerExamEvent().getId());
    assertNull(enrollmentCreated.getAuthHash());
    assertNotNull(enrollmentCreated.getPaymentLinkHash());
    assertNotNull(enrollmentCreated.getPerson());
    assertEquals(enrollmentCreated.getFirstName(), enrollmentCreated.getPerson().getFirstName());
    assertEquals(enrollmentCreated.getLastName(), enrollmentCreated.getPerson().getLastName());
    assertEquals(enrollmentCreated.getPerson().getOid(), onrOid);
    assertEquals(onrOid, onrBirthdateDTO.oid());
    assertEquals("21.2.1981", onrBirthdateDTO.birthdate());
  }

  @Test
  public void testCreatePersonForAppointmentWithExistingPerson() {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final EnrollmentAppointment enrollment = Factory.enrollmentContact(examiner);
    final Person person = Factory.person();

    enrollment.setExaminerExamEvent(examEvent);
    enrollment.setPerson(person);

    entityManager.persist(person);
    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    final String birthdate = "12.2.2000";
    final ExaminerEnrollmentBirthdateOrSsnDTO ssnDTO = ExaminerEnrollmentBirthdateOrSsnDTO
      .builder()
      .birthdateOrSsn(birthdate)
      .build();

    final ExaminerOnrBirthdateDTO onrBirthdateDTO = examinerEnrollmentService.createPersonForAppointment(
      examiner.getOid(),
      enrollment.getId(),
      ssnDTO
    );

    verify(onrService, never()).insertPersonalData(any(), any());

    final EnrollmentAppointment enrollmentCreated = enrollmentAppointmentRepository.getReferenceById(
      enrollment.getId()
    );
    entityManager.refresh(enrollmentCreated);

    assertEquals(EnrollmentAppointmentStatus.CONTACT_CREATED, enrollmentCreated.getStatus());
    assertEquals(examEvent.getId(), enrollmentCreated.getExaminerExamEvent().getId());
    assertNull(enrollmentCreated.getAuthHash());
    assertNotNull(enrollmentCreated.getPaymentLinkHash());
    assertEquals(person.getOid(), onrBirthdateDTO.oid());
    assertEquals(birthdate, onrBirthdateDTO.birthdate());
  }
}
