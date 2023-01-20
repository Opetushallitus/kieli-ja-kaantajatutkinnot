package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final AuditService auditService;

  @Transactional
  public ClerkEnrollmentDTO update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    enrollment.setOralSkill(dto.oralSkill());
    enrollment.setTextualSkill(dto.textualSkill());
    enrollment.setUnderstandingSkill(dto.understandingSkill());
    enrollment.setSpeakingPartialExam(dto.speakingPartialExam());
    enrollment.setSpeechComprehensionPartialExam(dto.speechComprehensionPartialExam());
    enrollment.setWritingPartialExam(dto.writingPartialExam());
    enrollment.setReadingComprehensionPartialExam(dto.readingComprehensionPartialExam());
    enrollment.setPreviousEnrollment(dto.previousEnrollment());
    enrollment.setDigitalCertificateConsent(dto.digitalCertificateConsent());
    enrollment.setEmail(dto.email());
    enrollment.setPhoneNumber(dto.phoneNumber());
    enrollment.setStreet(dto.street());
    enrollment.setPostalCode(dto.postalCode());
    enrollment.setTown(dto.town());
    enrollment.setCountry(dto.country());
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

    enrollment.setExamEvent(toExamEvent);
    enrollmentRepository.flush();

    auditService.logById(VktOperation.MOVE_ENROLLMENT, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }
}
