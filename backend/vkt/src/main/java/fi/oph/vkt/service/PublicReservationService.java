package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.ReservationRepository;
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

  private final ReservationRepository reservationRepository;
  private final Environment environment;

  @Transactional
  public PublicReservationDTO renewReservation(final long reservationId) {
    final Reservation reservation = reservationRepository.getReferenceById(reservationId);

    if (!reservation.isRenewable()) {
      throw new APIException(APIExceptionType.RENEW_RESERVATION_NOT_ALLOWED);
    }

    return createReservationDTO(updateExpiresAtForExistingReservation(reservation));
  }

  private LocalDateTime newExpiresAt() {
    return LocalDateTime.now().plus(Duration.parse(environment.getRequiredProperty("app.reservation.duration")));
  }

  @Transactional
  public PublicReservationDTO createOrReplaceReservation(final ExamEvent examEvent, final Person person) {
    final Reservation reservation = reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .map(this::replaceReservation)
      .orElseGet(() -> createNewReservation(examEvent, person));

    return this.createReservationDTO(reservation);
  }

  private Reservation replaceReservation(final Reservation reservation) {
    final Reservation newReservation = new Reservation();
    final ExamEvent examEvent = reservation.getExamEvent();
    final Person person = reservation.getPerson();

    reservationRepository.deleteById(reservation.getId());

    newReservation.setExamEvent(examEvent);
    newReservation.setPerson(person);
    newReservation.setExpiresAt(newExpiresAt());

    return reservationRepository.saveAndFlush(newReservation);
  }

  private Reservation createNewReservation(final ExamEvent examEvent, final Person person) {
    final Reservation reservation = new Reservation();
    reservation.setExamEvent(examEvent);
    reservation.setPerson(person);
    reservation.setExpiresAt(newExpiresAt());

    return reservationRepository.saveAndFlush(reservation);
  }

  private Reservation updateExpiresAtForExistingReservation(final Reservation reservation) {
    reservation.setExpiresAt(newExpiresAt());
    reservation.setRenewedAt(LocalDateTime.now());
    reservationRepository.flush();

    return reservation;
  }

  public PublicReservationDTO createReservationDTO(Reservation reservation) {
    final ZonedDateTime renewedAt = reservation.getRenewedAt() != null
      ? ZonedDateTime.of(reservation.getRenewedAt(), ZoneId.systemDefault())
      : null;

    return PublicReservationDTO
      .builder()
      .id(reservation.getId())
      .isRenewable(reservation.isRenewable())
      .renewedAt(renewedAt)
      .createdAt(ZonedDateTime.of(reservation.getCreatedAt(), ZoneId.systemDefault()))
      .expiresAt(ZonedDateTime.of(reservation.getExpiresAt(), ZoneId.systemDefault()))
      .build();
  }

  @Transactional
  public void deleteReservation(final long reservationId) {
    reservationRepository.deleteById(reservationId);
  }
}
