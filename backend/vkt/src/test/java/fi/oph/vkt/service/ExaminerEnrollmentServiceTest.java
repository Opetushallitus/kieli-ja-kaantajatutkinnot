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
import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentLinkDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.repository.*;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
        auditService
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
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades();

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
    final EnrollmentGrade enrollmentGrade = Factory.enrollmentGrades();

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

    final EnrollmentGradeDTO enrollmentGradeDTO1 = EnrollmentGradeDTO
            .builder()
            .grade(EnrollmentGradeType.SATISFACTORY)
            .comment("Comment1")
            .build();
    final ExaminerEnrollmentGradesDTO examinerEnrollmentGradesDTO = ExaminerEnrollmentGradesDTO
            .builder()
            .readingComprehensionPartialExam(enrollmentGradeDTO1)
            .build();

    final ExaminerEnrollmentGradesDTO responseDTO = examinerEnrollmentService.upsertAppointmentGrades(
            examiner.getOid(),
            enrollment.getId(),
            examinerEnrollmentGradesDTO
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
}
