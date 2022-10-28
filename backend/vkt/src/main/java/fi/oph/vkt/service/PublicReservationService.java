package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicReservationService {

  private final ExamEventRepository examEventRepository;
  private final ReservationRepository reservationRepository;
  private final Environment environment;

  @Transactional
  public PublicReservationDTO createReservation(final long examEventId, final Person person) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    final long participants = examEvent
      .getEnrollments()
      .stream()
      .filter(e -> e.getStatus() == EnrollmentStatus.PAID || e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT)
      .count();
    final long reservations = examEvent.getReservations().stream().filter(Reservation::isActive).count();

    if (ExamEventUtil.isCongested(participants, reservations, examEvent.getMaxParticipants())) {
      throw new APIException(APIExceptionType.CREATE_RESERVATION_CONGESTION);
    }
    if (examEvent.getRegistrationCloses().isBefore(LocalDate.now())) {
      throw new APIException(APIExceptionType.CREATE_RESERVATION_REGISTRATION_CLOSED);
    }

    final Reservation reservation = reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .map(this::updateExpiresAtForExistingReservation)
      .orElseGet(() -> createNewReservation(examEvent, person));

    return createReservationDTO(reservation, examEvent, person, participants);
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

  private PublicReservationDTO createReservationDTO(
    final Reservation reservation,
    final ExamEvent examEvent,
    final Person person,
    final long examEventParticipants
  ) {
    final PublicExamEventDTO examEventDTO = PublicExamEventDTO
      .builder()
      .id(examEvent.getId())
      .language(examEvent.getLanguage())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .participants(examEventParticipants)
      .maxParticipants(examEvent.getMaxParticipants())
      .hasCongestion(false)
      .build();

    final PublicPersonDTO personDTO = PublicPersonDTO
      .builder()
      .id(person.getId())
      .identityNumber(person.getIdentityNumber())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();

    final ZonedDateTime expiresAt = ZonedDateTime.of(reservation.getExpiresAt(), ZoneId.systemDefault());

    return PublicReservationDTO
      .builder()
      .id(reservation.getId())
      .expiresAt(expiresAt)
      .examEvent(examEventDTO)
      .person(personDTO)
      .build();
  }
}
