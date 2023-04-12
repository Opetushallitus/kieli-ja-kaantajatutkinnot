package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.EnrollmentDTOCommonFields;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.EnrollmentRepository;

public abstract class AbstractEnrollmentService {

  protected void copyDtoFieldsToEnrollment(final Enrollment enrollment, final EnrollmentDTOCommonFields dto) {
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
  }

  protected boolean isPersonEnrolled(
    final ExamEvent examEvent,
    final Person person,
    final EnrollmentRepository enrollmentRepository
  ) {
    return enrollmentRepository.findByExamEventAndPerson(examEvent, person).isPresent();
  }
}
