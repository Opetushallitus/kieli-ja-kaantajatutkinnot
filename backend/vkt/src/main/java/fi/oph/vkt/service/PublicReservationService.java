package fi.oph.vkt.service;

import fi.oph.vkt.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicReservationService {

  private final ReservationRepository reservationRepository;

  @Transactional
  public void deleteReservation(final long reservationId) {
    reservationRepository.deleteById(reservationId);
  }
}
