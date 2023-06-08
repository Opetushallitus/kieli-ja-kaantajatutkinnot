package fi.oph.vkt.service;

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
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final PaymentRepository paymentRepository;
  private final AuditService auditService;
  private final Environment environment;
  private final UUIDSource uuidSource;

  @Transactional
  public ClerkEnrollmentDTO update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    copyDtoFieldsToEnrollment(enrollment, dto);
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO changeStatus(final ClerkEnrollmentStatusChangeDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    enrollment.setStatus(dto.newStatus());
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO move(final ClerkEnrollmentMoveDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
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

    auditService.logById(VktOperation.MOVE_ENROLLMENT, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkPaymentLinkDTO createPaymentLink(final long enrollmentId) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final ExamEvent examEvent = enrollment.getExamEvent();
    final String baseUrl = environment.getRequiredProperty("app.base-url.api");

    if (enrollment.getPaymentLinkHash() == null) {
      enrollment.setPaymentLinkHash(uuidSource.getRandomNonce());
    }
    enrollment.setPaymentLinkExpiresAt(LocalDateTime.now().plusDays(1));
    enrollmentRepository.saveAndFlush(enrollment);

    return ClerkPaymentLinkDTO
      .builder()
      .url(String.format("%s/examEvent/%d/redirect/%s", baseUrl, examEvent.getId(), enrollment.getPaymentLinkHash()))
      .expiresAt(enrollment.getPaymentLinkExpiresAt())
      .build();
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void cancelUnfinishedEnrollment(final Enrollment enrollment) {
    assert enrollment.isUnfinished();

    enrollment.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
    enrollmentRepository.saveAndFlush(enrollment);
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteEnrollment(final Enrollment enrollment) {
    final List<Payment> payments = enrollment.getPayments();

    assert payments.stream().noneMatch(p -> p.getPaymentStatus() == PaymentStatus.OK);

    paymentRepository.deleteAllInBatch(enrollment.getPayments());
    enrollmentRepository.deleteById(enrollment.getId());
  }
}
