package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ParticipantSyncStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ParticipantSyncStatusRepository extends JpaRepository<ParticipantSyncStatus, Long> {
  List<ParticipantSyncStatus> findByExamSessionOrderByIdDesc(ExamSession examSession);

  // Matches Clojure's update-participant-sync-to-success!/-to-failed! - updates every
  // participant_sync_status row for the exam session, not just the latest one, since that's
  // what the shared table's own writers (this and the relocate feature, still Clojure-owned)
  // already do.
  @Modifying
  @Transactional
  @Query("UPDATE ParticipantSyncStatus p SET p.successAt = CURRENT_TIMESTAMP WHERE p.examSession = :examSession")
  void markSuccess(@Param("examSession") ExamSession examSession);

  @Modifying
  @Transactional
  @Query("UPDATE ParticipantSyncStatus p SET p.failedAt = CURRENT_TIMESTAMP WHERE p.examSession = :examSession")
  void markFailed(@Param("examSession") ExamSession examSession);
}
