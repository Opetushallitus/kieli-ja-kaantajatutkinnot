package fi.oph.vkt.repository;

import fi.oph.vkt.model.Reservation;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.persistence.Tuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  @Query(
    "SELECT e.id as examEventId, COUNT(r) as count FROM Reservation r" +
    " JOIN r.examEvent e" +
    " WHERE CURRENT_TIMESTAMP < r.expiresAt" +
    " GROUP BY e.id"
  )
  Stream<Tuple> _countActiveReservationsByExamEvent();

  default Map<Long, Integer> countActiveReservationsByExamEvent() {
    return _countActiveReservationsByExamEvent()
      .collect(Collectors.toMap(t -> t.get("examEventId", Long.class), t -> t.get("count", Long.class).intValue()));
  }
}
