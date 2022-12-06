package fi.oph.vkt.repository;

import fi.oph.vkt.model.Email;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
  @Query("SELECT e.id FROM Email e WHERE e.sentAt IS NULL ORDER BY e.modifiedAt asc")
  List<Long> findEmailsToSend(PageRequest pageRequest);
}
