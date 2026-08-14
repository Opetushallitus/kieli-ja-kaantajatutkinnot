package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ParticipantSyncStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantSyncStatusRepository extends JpaRepository<ParticipantSyncStatus, Long> {
  List<ParticipantSyncStatus> findByExamSessionOrderByIdDesc(ExamSession examSession);
}
