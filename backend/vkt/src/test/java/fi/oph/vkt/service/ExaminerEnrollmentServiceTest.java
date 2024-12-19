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
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
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

    examinerEnrollmentService = new ExaminerEnrollmentService(
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
    final ExaminerEnrollmentAppointmentDTO responseDTO = examinerEnrollmentService.updateAppointment(examiner.getOid(), enrollment.getId(), dto);

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
}
