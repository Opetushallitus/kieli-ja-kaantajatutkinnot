package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicReservationDTO;
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

    if (!reservation.canRenew()) {
      throw new APIException(APIExceptionType.RENEW_RESERVATION_NOT_ALLOWED);
    }

    return createReservationDTO(updateExpiresAtForExistingReservation(reservation));
  }

  private LocalDateTime newExpiresAt() {
    return LocalDateTime.now().plus(Duration.parse(environment.getRequiredProperty("app.reservation.duration")));
  }

  public Reservation updateExpiresAtForExistingReservation(final Reservation reservation) {
    reservation.setExpiresAt(newExpiresAt());
    reservation.setExpiresUpdatedAt(LocalDateTime.now());
    reservation.setRenewCount(reservation.getRenewCount() + 1);
    reservationRepository.flush();

    return reservation;
  }

  public PublicReservationDTO createReservationDTO(Reservation reservation) {
    return PublicReservationDTO
      .builder()
      .id(reservation.getId())
      .renewCount(reservation.getRenewCount())
      .canRenew(reservation.canRenew())
      .active(reservation.isActive())
      .expiresUpdatedAt(ZonedDateTime.of(reservation.getExpiresUpdatedAt(), ZoneId.systemDefault()))
      .expiresAt(ZonedDateTime.of(reservation.getExpiresAt(), ZoneId.systemDefault()))
      .build();
  }

  @Transactional
  public void deleteReservation(final long reservationId) {
    reservationRepository.deleteById(reservationId);
  }
}
