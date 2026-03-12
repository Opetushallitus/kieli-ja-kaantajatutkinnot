package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSessionTicket;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamSessionTicketRepository extends JpaRepository<ExamSessionTicket, Long> {
  @Query(
    value = """
      SELECT * FROM exam_session_ticket
      WHERE exam_session_id = :examSessionId
      AND type = CAST(:type AS exam_session_ticket_type)
      AND registration_id IS NULL
      ORDER BY id
      FOR NO KEY UPDATE SKIP LOCKED
      LIMIT 1
      """,
    nativeQuery = true
  )
  Optional<ExamSessionTicket> lockOneTicketForUpdate(
    @Param("examSessionId") Long examSessionId,
    @Param("type") String type
  );
}
