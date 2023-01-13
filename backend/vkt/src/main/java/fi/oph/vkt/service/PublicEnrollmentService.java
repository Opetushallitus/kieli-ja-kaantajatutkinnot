package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final PersonRepository personRepository;
  private final ReservationRepository reservationRepository;
  private final Environment environment;

  @Transactional
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final long participants = getParticipants(enrollments);
    final boolean hasQueue = enrollments.stream().anyMatch(e -> e.getStatus() == EnrollmentStatus.QUEUED);
    final long openings = hasQueue ? 0L : examEvent.getMaxParticipants() - participants;
    final long reservations = examEvent.getReservations().stream().filter(Reservation::isActive).count();

    if (openings <= 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_IS_FULL);
    }
    if (ExamEventUtil.isCongested(openings, reservations)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_HAS_CONGESTION);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }

    final Reservation reservation = reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .map(this::updateExpiresAtForExistingReservation)
      .orElseGet(() -> createNewReservation(examEvent, person));

    final PublicReservationDTO reservationDTO = PublicReservationDTO
      .builder()
      .id(reservation.getId())
      .expiresAt(ZonedDateTime.of(reservation.getExpiresAt(), ZoneId.systemDefault()))
      .build();

    return createEnrollmentInitialisationDTO(examEvent, person, openings, reservationDTO);
  }

  private long getParticipants(final List<Enrollment> enrollments) {
    return enrollments
      .stream()
      .filter(e -> e.getStatus() == EnrollmentStatus.PAID || e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT)
      .count();
  }

  private Reservation updateExpiresAtForExistingReservation(final Reservation reservation) {
    reservation.setExpiresAt(newExpiresAt());
    reservationRepository.flush();

    return reservation;
  }

  private Reservation createNewReservation(final ExamEvent examEvent, final Person person) {
    final Reservation reservation = new Reservation();
    reservation.setExamEvent(examEvent);
    reservation.setPerson(person);
    reservation.setExpiresAt(newExpiresAt());

    return reservationRepository.saveAndFlush(reservation);
  }

  private LocalDateTime newExpiresAt() {
    return LocalDateTime.now().plus(Duration.parse(environment.getRequiredProperty("app.reservation.duration")));
  }

  private PublicEnrollmentInitialisationDTO createEnrollmentInitialisationDTO(
    final ExamEvent examEvent,
    final Person person,
    final long openings,
    final PublicReservationDTO reservationDTO
  ) {
    final PublicExamEventDTO examEventDTO = PublicExamEventDTO
      .builder()
      .id(examEvent.getId())
      .language(examEvent.getLanguage())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .openings(openings)
      .hasCongestion(false)
      .build();

    final PublicPersonDTO personDTO = PublicPersonDTO
      .builder()
      .id(person.getId())
      .identityNumber(person.getIdentityNumber())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();

    return PublicEnrollmentInitialisationDTO
      .builder()
      .examEvent(examEventDTO)
      .person(personDTO)
      .reservation(reservationDTO)
      .build();
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final long participants = getParticipants(enrollments);
    final boolean hasQueue = enrollments.stream().anyMatch(e -> e.getStatus() == EnrollmentStatus.QUEUED);
    final long openings = examEvent.getMaxParticipants() - participants;

    if (!hasQueue && openings > 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }

    return createEnrollmentInitialisationDTO(examEvent, person, openings, null);
  }

  @Transactional
  public void createEnrollment(final PublicEnrollmentCreateDTO dto, final long reservationId) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);

    final Enrollment enrollment = new Enrollment();
    enrollment.setExamEvent(reservation.getExamEvent());
    enrollment.setPerson(reservation.getPerson());
    enrollment.setStatus(EnrollmentStatus.PAID);

    copyDtoFieldsToEnrollment(dto, enrollment);

    enrollmentRepository.saveAndFlush(enrollment);
    reservationRepository.deleteById(reservationId);
  }

  private void copyDtoFieldsToEnrollment(final PublicEnrollmentCreateDTO dto, final Enrollment enrollment) {
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
  }

  @Transactional
  public void createEnrollmentToQueue(
    final PublicEnrollmentCreateDTO dto,
    final long examEventId,
    final long personId
  ) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final Person person = personRepository.getReferenceById(personId);

    final Enrollment enrollment = new Enrollment();
    enrollment.setExamEvent(examEvent);
    enrollment.setPerson(person);
    enrollment.setStatus(EnrollmentStatus.QUEUED);

    copyDtoFieldsToEnrollment(dto, enrollment);

    enrollmentRepository.saveAndFlush(enrollment);
  }
}
