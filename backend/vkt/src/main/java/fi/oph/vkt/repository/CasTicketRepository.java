package fi.oph.vkt.repository;

import fi.oph.vkt.model.CasTicket;
import fi.oph.vkt.model.Person;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface CasTicketRepository extends BaseRepository<CasTicket> {
  Optional<CasTicket> findByPerson(final Person person);

  void deleteAllByTicket(final String ticket);
  void deleteAllByPerson(final Person person);
}
