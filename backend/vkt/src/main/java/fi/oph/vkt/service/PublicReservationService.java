package fi.oph.vkt.service;

import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.exception.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicReservationService {

  private final ReservationRepository reservationRepository;

  @Transactional
  public void deleteReservation(final long reservationId) {
    if (!reservationRepository.existsById(reservationId)) {
      throw new NotFoundException(String.format("Reservation by id: %d not found", reservationId));
    }

    reservationRepository.deleteAllByIdInBatch(List.of(reservationId));
  }
}
