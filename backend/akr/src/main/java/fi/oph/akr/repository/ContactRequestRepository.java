package fi.oph.akr.repository;

import fi.oph.akr.model.ContactRequest;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestRepository extends BaseRepository<ContactRequest> {
  @Query("SELECT cr FROM ContactRequest cr WHERE cr.createdAt < ?1")
  List<ContactRequest> findObsoleteContactRequests(LocalDateTime createdBefore);
}
