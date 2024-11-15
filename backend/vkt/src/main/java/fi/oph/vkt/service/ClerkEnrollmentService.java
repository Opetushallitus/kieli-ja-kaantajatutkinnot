package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentGradesDTO;
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
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentGradesRepository;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.FreeEnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService extends AbstractEnrollmentService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkEnrollmentService.class);

  private final EnrollmentRepository enrollmentRepository;
  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final EnrollmentGradesRepository enrollmentGradesRepository;
  private final ExamEventRepository examEventRepository;
  private final PaymentRepository paymentRepository;
  private final AuditService auditService;
  private final Environment environment;
  private final UUIDSource uuidSource;
  private final FreeEnrollmentRepository freeEnrollmentRepository;
  private final KoskiService koskiService;

  @Transactional
  public ClerkEnrollmentDTO update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final FreeEnrollment freeEnrollment = enrollment.getFreeEnrollment();
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    if (dto.freeEnrollmentBasis() != null && freeEnrollment != null) {
      freeEnrollment.setApproved(dto.freeEnrollmentBasis().approved());
      freeEnrollment.setComment(dto.freeEnrollmentBasis().comment());
      freeEnrollmentRepository.flush();

      // If clerk user has explicitly approved or rejected the qualifications for free enrollment,
      // the enrollment status should be updated accordingly.
      // However, we must guard against updating the status of eg. already cancelled enrollments by accident.
      if (
        dto.freeEnrollmentBasis().approved() != null &&
        (
          enrollment.getStatus() == EnrollmentStatus.AWAITING_APPROVAL ||
          enrollment.getStatus() == EnrollmentStatus.AWAITING_PAYMENT ||
          enrollment.getStatus() == EnrollmentStatus.COMPLETED
        )
      ) {
        if (dto.freeEnrollmentBasis().approved()) {
          enrollment.setStatus(EnrollmentStatus.COMPLETED);
        } else {
          enrollment.setStatus(EnrollmentStatus.AWAITING_PAYMENT);
        }
      }
    }

    copyDtoFieldsToEnrollment(enrollment, dto);
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);

    final FreeEnrollmentDetails freeEnrollmentDetails = enrollmentRepository.countEnrollmentsByPerson(
      enrollment.getPerson()
    );
    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(
      enrollmentRepository.getReferenceById(enrollment.getId()),
      freeEnrollmentDetails
    );
  }

  @Transactional
  public ClerkEnrollmentDTO changeStatus(final ClerkEnrollmentStatusChangeDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    enrollment.setStatus(dto.newStatus());
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId(), oldAuditDto, newAuditDto);

    final FreeEnrollmentDetails freeEnrollmentDetails = enrollmentRepository.countEnrollmentsByPerson(
      enrollment.getPerson()
    );
    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(
      enrollmentRepository.getReferenceById(enrollment.getId()),
      freeEnrollmentDetails
    );
  }

  @Transactional
  public ClerkEnrollmentDTO move(final ClerkEnrollmentMoveDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    final ExamEvent toExamEvent = examEventRepository.getReferenceById(dto.toExamEventId());
    if (enrollment.getExamEvent().getLanguage() != toExamEvent.getLanguage()) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH);
    }
    if (findEnrollment(toExamEvent, enrollment.getPerson(), enrollmentRepository).isPresent()) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED);
    }

    enrollment.setExamEvent(toExamEvent);
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.MOVE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);

    final FreeEnrollmentDetails freeEnrollmentDetails = enrollmentRepository.countEnrollmentsByPerson(
      enrollment.getPerson()
    );
    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(
      enrollmentRepository.getReferenceById(enrollment.getId()),
      freeEnrollmentDetails
    );
  }

  @Transactional
  public ClerkPaymentLinkDTO createPaymentLink(final long enrollmentId) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final ExamEvent examEvent = enrollment.getExamEvent();
    final String baseUrl = environment.getRequiredProperty("app.base-url.api");
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);

    if (enrollment.getPaymentLinkHash() == null) {
      enrollment.setPaymentLinkHash(uuidSource.getRandomNonce());
    }
    enrollment.setPaymentLinkExpiresAt(LocalDateTime.now().plusDays(1));
    enrollmentRepository.saveAndFlush(enrollment);

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT_PAYMENT_LINK, enrollment.getId(), oldAuditDto, newAuditDto);

    return ClerkPaymentLinkDTO
      .builder()
      .url(String.format("%s/examEvent/%d/redirect/%s", baseUrl, examEvent.getId(), enrollment.getPaymentLinkHash()))
      .expiresAt(enrollment.getPaymentLinkExpiresAt())
      .build();
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void cancelPassiveEnrollmentsExpectingPayment() {
    final Duration paymentTime = Duration.of(3, ChronoUnit.HOURS);

    enrollmentRepository
      .findAllByStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT)
      .stream()
      .filter(e -> e.getModifiedAt().plus(paymentTime).isBefore(LocalDateTime.now()))
      .forEach(enrollment -> {
        enrollment.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
        enrollmentRepository.saveAndFlush(enrollment);
      });
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteCanceledUnfinishedEnrollments() {
    final Duration ttl = Duration.of(24, ChronoUnit.HOURS);

    enrollmentRepository
      .findAllByStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT)
      .stream()
      .filter(e -> e.getModifiedAt().plus(ttl).isBefore(LocalDateTime.now()))
      .forEach(enrollment -> {
        final List<Payment> payments = enrollment.getPayments();

        if (payments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.OK)) {
          LOG.warn(String.format("Tried to delete enrollment (%d) with paid payment", enrollment.getId()));
        } else {
          paymentRepository.deleteAllInBatch(payments);
          enrollmentRepository.deleteById(enrollment.getId());
        }
      });
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void getAndSaveKoskiEducationDetailsForEnrollment(final long enrollmentId) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final FreeEnrollment freeEnrollment = enrollment.getFreeEnrollment();
    if (freeEnrollment == null || freeEnrollment.getSource() != FreeEnrollmentSource.KOSKI) {
      throw new RuntimeException("Can't persist education details if source of free enrollment isn't Koski");
    }
    List<PublicEducationDTO> educationDTOs = koskiService.findEducations(enrollment.getPerson().getOid());
    if (educationDTOs.isEmpty()) {
      throw new RuntimeException("Koski returned empty education details");
    }
    koskiService.saveEducationsForEnrollment(freeEnrollment, enrollment.getExamEvent().getId(), educationDTOs);
  }

  @Transactional(readOnly = true)
  public ClerkEnrollmentContactRequestDTO getEnrollmentContactRequest(final long enrollmentContactId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentContactId
    );

    return ClerkEnrollmentUtil.createClerkEnrollmentContactDTO(enrollmentAppointment);
  }

  @Transactional
  public ExaminerEnrollmentAppointmentDTO convertToAppointment(final long enrollmentContactId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentContactId
    );
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    enrollmentAppointment.setStatus(EnrollmentAppointmentStatus.WAITING_AUTHENTICATION);

    if (enrollmentAppointment.getAuthHash() == null) {
      enrollmentAppointment.setAuthHash(uuidSource.getRandomNonce());
    }

    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public ExaminerEnrollmentAppointmentDTO getEnrollmentAppointment(final long enrollmentAppointmentId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional
  public ClerkEnrollmentGradesDTO upsertAppointmentGrades(
    final long enrollmentAppointmentId,
    final ClerkEnrollmentGradesDTO dto
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    final Optional<EnrollmentGrade> enrollmentGradeOptional = enrollmentGradesRepository.findByEnrollmentAppointment(
      enrollmentAppointment
    );
    final EnrollmentGrade enrollmentGrade = enrollmentGradeOptional.orElseGet(EnrollmentGrade::new);

    enrollmentGrade.setSpeakingPartialExamGrade(dto.speakingPartialExam().grade());
    enrollmentGrade.setWritingPartialExamGrade(dto.writingPartialExam().grade());
    enrollmentGrade.setSpeechComprehensionPartialExamGrade(dto.speechComprehensionPartialExam().grade());
    enrollmentGrade.setReadingComprehensionPartialExamGrade(dto.readingComprehensionPartialExam().grade());

    enrollmentGrade.setSpeakingPartialExamComment(dto.speakingPartialExam().comment());
    enrollmentGrade.setWritingPartialExamComment(dto.writingPartialExam().comment());
    enrollmentGrade.setSpeechComprehensionPartialExamComment(dto.speechComprehensionPartialExam().comment());
    enrollmentGrade.setReadingComprehensionPartialExamComment(dto.readingComprehensionPartialExam().comment());

    enrollmentGradesRepository.saveAndFlush(enrollmentGrade);

    enrollmentAppointment.setGrade(enrollmentGrade);
    enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);

    return ClerkEnrollmentGradesDTO
      .builder()
      .writingPartialExam(
        createGradeDTO(enrollmentGrade.getWritingPartialExamGrade(), enrollmentGrade.getWritingPartialExamComment())
      )
      .readingComprehensionPartialExam(
        createGradeDTO(
          enrollmentGrade.getReadingComprehensionPartialExamGrade(),
          enrollmentGrade.getReadingComprehensionPartialExamComment()
        )
      )
      .speakingPartialExam(
        createGradeDTO(enrollmentGrade.getSpeakingPartialExamGrade(), enrollmentGrade.getSpeakingPartialExamComment())
      )
      .speechComprehensionPartialExam(
        createGradeDTO(
          enrollmentGrade.getSpeechComprehensionPartialExamGrade(),
          enrollmentGrade.getSpeechComprehensionPartialExamComment()
        )
      )
      .build();
  }

  private EnrollmentGradeDTO createGradeDTO(final EnrollmentGradeType grade, final String comment) {
    return EnrollmentGradeDTO.builder().grade(grade).comment(comment).build();
  }
}
