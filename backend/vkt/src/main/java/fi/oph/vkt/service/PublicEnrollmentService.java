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
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
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
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    final PublicReservationDTO reservationDTO = publicReservationService.createOrReplaceReservation(examEvent, person);

    return createEnrollmentInitialisationDTO(examEvent, person, openings, reservationDTO);
  }

  private long getParticipants(final List<Enrollment> enrollments) {
    return enrollments
      .stream()
      .filter(e -> e.getStatus() == EnrollmentStatus.PAID || e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT)
      .count();
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
      .dateOfBirth(person.getDateOfBirth())
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
    if (isPersonEnrolled(examEvent, person, enrollmentRepository)) {
      throw new APIException(APIExceptionType.INITIALISE_ENROLLMENT_DUPLICATE_PERSON);
    }

    return createEnrollmentInitialisationDTO(examEvent, person, openings, null);
  }

  @Transactional
  public Long createEnrollment(final PublicEnrollmentCreateDTO dto, final long reservationId, final Person person)
    throws IOException, InterruptedException {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);

    if (person.getId() != reservation.getPerson().getId()) {
      throw new APIException(APIExceptionType.RESERVATION_PERSON_SESSION_MISMATCH);
    }

    final Enrollment enrollment = new Enrollment();
    enrollment.setExamEvent(reservation.getExamEvent());
    enrollment.setPerson(reservation.getPerson());
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);

    copyDtoFieldsToEnrollment(enrollment, dto);
    if (dto.digitalCertificateConsent()) {
      clearAddress(enrollment);
    }

    enrollmentRepository.saveAndFlush(enrollment);
    reservationRepository.deleteById(reservationId);

    // TODO: Move to payment success
    // publicEnrollmentEmailService.sendEnrollmentConfirmationEmail(enrollment, person);

    return enrollment.getId();
  }

  private void clearAddress(final Enrollment enrollment) {
    enrollment.setStreet(null);
    enrollment.setPostalCode(null);
    enrollment.setTown(null);
    enrollment.setCountry(null);
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

    copyDtoFieldsToEnrollment(enrollment, dto);
    if (dto.digitalCertificateConsent()) {
      clearAddress(enrollment);
    }

    enrollmentRepository.saveAndFlush(enrollment);

    publicEnrollmentEmailService.sendEnrollmentToQueueConfirmationEmail(enrollment, person);
  }
}
