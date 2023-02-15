package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
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

    reservation.setExpiresAt(newExpiresAt());
    reservationRepository.flush();

    return createReservationDTO(reservation);
  }

  private LocalDateTime newExpiresAt() {
    return LocalDateTime.now().plus(Duration.parse(environment.getRequiredProperty("app.reservation.duration")));
  }

  @Transactional
  public PublicReservationDTO createOrReplaceReservation(final ExamEvent examEvent, final Person person) {
    reservationRepository
      .findByExamEventAndPerson(examEvent, person)
      .ifPresent(reservation -> reservationRepository.deleteById(reservation.getId()));

    final Reservation reservation = new Reservation();
    reservation.setExamEvent(examEvent);
    reservation.setPerson(person);
    reservation.setExpiresAt(newExpiresAt());

    reservationRepository.saveAndFlush(reservation);

    return createReservationDTO(reservation);
  }

  private PublicReservationDTO createReservationDTO(final Reservation reservation) {
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
