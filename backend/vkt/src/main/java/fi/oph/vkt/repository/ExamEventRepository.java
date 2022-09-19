package fi.oph.vkt.repository;

import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.exam.ExamLevel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamEventRepository extends JpaRepository<ExamEvent, Long> {
  // TODO: fetch information of participants and congestion
  @Query(
    "SELECT new fi.oph.vkt.repository.PublicExamEventProjection(e.id, e.language, e.date, e.registrationCloses," +
    " 0, e.maxParticipants, false)" +
    " FROM ExamEvent e" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_DATE" +
    " AND e.isVisible = true"
  )
  List<PublicExamEventProjection> listPublicExamEventProjections(final ExamLevel level);

  // TODO: fetch information of participants
  @Query(
    "SELECT new fi.oph.vkt.repository.ClerkExamEventProjection(e.id, e.language, e.level, e.date," +
    " e.registrationCloses, 0, e.maxParticipants, e.isVisible)" +
    " FROM ExamEvent e"
  )
  List<ClerkExamEventProjection> listClerkExamEventProjections();
}
