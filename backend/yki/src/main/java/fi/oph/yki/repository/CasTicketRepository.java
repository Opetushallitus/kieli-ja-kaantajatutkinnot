package fi.oph.yki.repository;

import fi.oph.yki.model.CasTicket;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface CasTicketRepository extends BaseRepository<CasTicket> {
  Optional<CasTicket> findBySessionId(final String session_id);
  Optional<CasTicket> findByTicket(final String ticket);

  void deleteAllByTicket(final String ticket);
  void deleteAllBySessionId(final String session_id);

  List<CasTicket> findByCreatedAtIsBefore(final LocalDateTime before);
}
