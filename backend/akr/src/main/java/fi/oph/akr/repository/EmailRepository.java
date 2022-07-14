package fi.oph.akr.repository;

import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
  @Query("SELECT e.id FROM Email e WHERE e.sentAt IS NULL ORDER BY e.modifiedAt asc")
  List<Long> findEmailsToSend(PageRequest pageRequest);

  @Query("SELECT e FROM Email e WHERE e.createdAt < ?1 AND e.emailType IN ?2")
  List<Email> findObsoleteEmails(LocalDateTime createdBefore, List<EmailType> emailTypes);
}
