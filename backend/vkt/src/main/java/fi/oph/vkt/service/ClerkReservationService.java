package fi.oph.vkt.service;

import fi.oph.vkt.repository.ReservationRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkReservationService {

  private final ReservationRepository reservationRepository;

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteExpiredReservations() {
    // Pretty much arbitrary ttl after expiry time of a reservation
    final Duration ttl = Duration.of(1, ChronoUnit.HOURS);

    reservationRepository
      .findAll()
      .stream()
      .filter(r -> r.getExpiresAt().plus(ttl).isBefore(LocalDateTime.now()))
      .forEach(reservation -> reservationRepository.deleteById(reservation.getId()));
  }
}
