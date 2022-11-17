package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final AuditService auditService;

  @Transactional
  public void update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    enrollment.setOralSkill(dto.oralSkill());
    enrollment.setTextualSkill(dto.textualSkill());
    enrollment.setUnderstandingSkill(dto.understandingSkill());
    enrollment.setSpeakingPartialExam(dto.speakingPartialExam());
    enrollment.setSpeechComprehensionPartialExam(dto.speechComprehensionPartialExam());
    enrollment.setWritingPartialExam(dto.writingPartialExam());
    enrollment.setReadingComprehensionPartialExam(dto.readingComprehensionPartialExam());
    enrollment.setPreviousEnrollmentDate(dto.previousEnrollmentDate());
    enrollment.setDigitalCertificateConsent(dto.digitalCertificateConsent());
    enrollment.setEmail(dto.email());
    enrollment.setPhoneNumber(dto.phoneNumber());
    enrollment.setStreet(dto.street());
    enrollment.setPostalCode(dto.postalCode());
    enrollment.setTown(dto.town());
    enrollment.setCountry(dto.country());
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT, enrollment.getId());
  }

  @Transactional
  public void changeStatus(final ClerkEnrollmentStatusChangeDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    enrollment.setStatus(dto.newStatus());
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId());
  }
}
