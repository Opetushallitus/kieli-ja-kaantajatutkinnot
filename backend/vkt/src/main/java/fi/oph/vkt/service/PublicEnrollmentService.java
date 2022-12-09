package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ReservationRepository reservationRepository;

  @Transactional
  public void createEnrollment(final PublicEnrollmentCreateDTO dto, final long reservationId) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);

    final Enrollment enrollment = new Enrollment();
    enrollment.setExamEvent(reservation.getExamEvent());
    enrollment.setPerson(reservation.getPerson());
    enrollment.setStatus(EnrollmentStatus.PAID);

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
    enrollment.setStreet(!dto.digitalCertificateConsent() ? dto.street() : null);
    enrollment.setPostalCode(!dto.digitalCertificateConsent() ? dto.postalCode() : null);
    enrollment.setTown(!dto.digitalCertificateConsent() ? dto.town() : null);
    enrollment.setCountry(!dto.digitalCertificateConsent() ? dto.country() : null);

    enrollmentRepository.saveAndFlush(enrollment);
    reservationRepository.deleteById(reservationId);
  }
}
