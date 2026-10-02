package fi.oph.yki.repository;

import fi.oph.yki.model.PersonSyncStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonSyncStatusRepository extends JpaRepository<PersonSyncStatus, Long> {
  @Query(
    "SELECT pss FROM PersonSyncStatus pss " +
    "WHERE pss.successAt IS NULL " +
    "AND (pss.shouldRetry IS NULL OR pss.shouldRetry = true) " +
    "AND pss.created > :retryDeadline"
  )
  List<PersonSyncStatus> findPendingSyncs(@Param("retryDeadline") LocalDateTime retryDeadline);
}
