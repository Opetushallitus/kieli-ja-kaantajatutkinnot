package fi.oph.otr.repository;

import fi.oph.otr.model.Email;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailRepository extends BaseRepository<Email> {
  @Query("SELECT e.id FROM Email e WHERE e.sentAt IS NULL ORDER BY e.modifiedAt asc")
  List<Long> findEmailsToSend(PageRequest pageRequest);
}
