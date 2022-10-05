package fi.oph.vkt.repository;

import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.type.ExamLevel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamEventRepository extends JpaRepository<ExamEvent, Long> {
  // TODO: fetch information of congestion
  @Query(
    "SELECT new fi.oph.vkt.repository.PublicExamEventProjection(e.id, e.language, e.date, e.registrationCloses," +
    " COUNT(en), e.maxParticipants, false)" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'PAID' OR en.status = 'EXPECTING_PAYMENT'" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_DATE" +
    " AND e.isVisible = true" +
    " GROUP BY e.id"
  )
  List<PublicExamEventProjection> listPublicExamEventProjections(final ExamLevel level);

  @Query(
    "SELECT new fi.oph.vkt.repository.ClerkExamEventProjection(e.id, e.language, e.level, e.date," +
    " e.registrationCloses, COUNT(en), e.maxParticipants, e.isVisible)" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'PAID' OR en.status = 'EXPECTING_PAYMENT'" +
    " GROUP BY e.id"
  )
  List<ClerkExamEventProjection> listClerkExamEventProjections();
}
