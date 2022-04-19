package fi.oph.akt.repository;

import fi.oph.akt.model.Email;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {

	@Query("SELECT e.id FROM Email e WHERE e.sentAt IS NULL ORDER BY e.modifiedAt asc")
	List<Long> findEmailsToSend(PageRequest pageRequest);

}
