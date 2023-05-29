package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final PersonRepository personRepository;
  private final PublicEnrollmentEmailService publicEnrollmentEmailService;
  private final PublicReservationService publicReservationService;
  private final ReservationRepository reservationRepository;

  @Transactional
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = getOpenings(examEvent);
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
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    final PublicReservationDTO reservationDTO = publicReservationService.createOrReplaceReservation(examEvent, person);

    return createEnrollmentInitialisationDTO(examEvent, person, openings, reservationDTO, Optional.empty());
  }

  private long getParticipants(final List<Enrollment> enrollments) {
    return enrollments
      .stream()
      .filter(e ->
        e.getStatus() == EnrollmentStatus.PAID ||
        e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT ||
        e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
      )
      .count();
  }

  private long getOpenings(final ExamEvent examEvent) {
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final long participants = getParticipants(enrollments);
    final boolean hasQueue = enrollments.stream().anyMatch(e -> e.getStatus() == EnrollmentStatus.QUEUED);

    return hasQueue ? 0L : examEvent.getMaxParticipants() - participants;
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO getEnrollmentInitialisationDTO(long examEventId, Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final Optional<Reservation> optionalReservation = reservationRepository.findByExamEventAndPerson(examEvent, person);
    final Optional<Enrollment> optionalEnrollment = findEnrollment(examEvent, person, enrollmentRepository);
    final PublicReservationDTO reservationDTO = optionalReservation
      .map(publicReservationService::createReservationDTO)
      .orElse(null);
    final long openings = getOpenings(examEvent);

    return createEnrollmentInitialisationDTO(examEvent, person, openings, reservationDTO, optionalEnrollment);
  }

  private PublicEnrollmentDTO createEnrollmentDTO(final Enrollment enrollment) {
    return PublicEnrollmentDTO
      .builder()
      .id(enrollment.getId())
      .oralSkill(enrollment.isOralSkill())
      .textualSkill(enrollment.isTextualSkill())
      .understandingSkill(enrollment.isUnderstandingSkill())
      .speakingPartialExam(enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
      .previousEnrollment(enrollment.getPreviousEnrollment())
      .digitalCertificateConsent(enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry())
      .build();
  }

  private PublicEnrollmentInitialisationDTO createEnrollmentInitialisationDTO(
    final ExamEvent examEvent,
    final Person person,
    final long openings,
    final PublicReservationDTO reservationDTO,
    final Optional<Enrollment> optionalEnrollment
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
      .dateOfBirth(person.getDateOfBirth())
      .firstName(person.getFirstName())
      .build();

    return optionalEnrollment.isPresent()
      ? PublicEnrollmentInitialisationDTO
        .builder()
        .examEvent(examEventDTO)
        .person(personDTO)
        .reservation(reservationDTO)
        .enrollment(createEnrollmentDTO(optionalEnrollment.get()))
        .build()
      : PublicEnrollmentInitialisationDTO
        .builder()
        .examEvent(examEventDTO)
        .person(personDTO)
        .reservation(reservationDTO)
        .build();
  }

  @Transactional(readOnly = true)
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final long openings = getOpenings(examEvent);

    if (openings > 0) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_REGISTRATION_CLOSED);
    }
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    return createEnrollmentInitialisationDTO(examEvent, person, openings, null, Optional.empty());
  }

  @Transactional
  public PublicEnrollmentDTO createEnrollment(
    final PublicEnrollmentCreateDTO dto,
    final long reservationId,
    final Person person
  ) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);

    if (person.getId() != reservation.getPerson().getId()) {
      throw new APIException(APIExceptionType.RESERVATION_PERSON_SESSION_MISMATCH);
    }

    final Enrollment enrollment = findEnrollment(reservation.getExamEvent(), person, enrollmentRepository)
      .orElseGet(Enrollment::new);
    enrollment.setExamEvent(reservation.getExamEvent());
    enrollment.setPerson(reservation.getPerson());
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);

    copyDtoFieldsToEnrollment(enrollment, dto);
    if (dto.digitalCertificateConsent()) {
      clearAddress(enrollment);
    }

    enrollmentRepository.saveAndFlush(enrollment);
    reservationRepository.deleteById(reservationId);

    return createEnrollmentDTO(enrollment);
  }

  private void clearAddress(final Enrollment enrollment) {
    enrollment.setStreet(null);
    enrollment.setPostalCode(null);
    enrollment.setTown(null);
    enrollment.setCountry(null);
  }

  @Transactional
  public PublicEnrollmentDTO createEnrollmentToQueue(
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

    copyDtoFieldsToEnrollment(enrollment, dto);
    if (dto.digitalCertificateConsent()) {
      clearAddress(enrollment);
    }

    enrollmentRepository.saveAndFlush(enrollment);

    publicEnrollmentEmailService.sendEnrollmentToQueueConfirmationEmail(enrollment, person);

    return createEnrollmentDTO(enrollment);
  }
}
