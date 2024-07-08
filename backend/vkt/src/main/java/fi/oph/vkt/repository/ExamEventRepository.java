package fi.oph.vkt.repository;

import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.type.ExamLevel;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamEventRepository extends BaseRepository<ExamEvent> {
  @Query(
    "SELECT new fi.oph.vkt.repository.PublicExamEventProjection(e.id, e.language, e.date, e.registrationCloses," +
    " COUNT(en), e.maxParticipants)" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'COMPLETED' OR en.status = 'AWAITING_PAYMENT' OR en.status = 'AWAITING_APPROVAL' OR en.status = 'EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT'" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_DATE" +
    " AND e.isHidden = false" +
    " GROUP BY e.id"
  )
  List<PublicExamEventProjection> listPublicExamEventProjections(final ExamLevel level);

  @Query(
    "SELECT e.id" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'QUEUED'" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_DATE" +
    " AND e.isHidden = false" +
    " GROUP BY e.id" +
    " HAVING COUNT(en) > 0"
  )
  Set<Long> listPublicExamEventIdsWithQueue(final ExamLevel level);

  @Query(
    "SELECT e.id" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'QUEUED'" +
    " GROUP BY e.id" +
    " HAVING COUNT(en) > 0"
  )
  Set<Long> listClertExamEventIdsWithQueue();

  @Query(
    "SELECT new fi.oph.vkt.repository.ClerkExamEventProjection(e.id, e.language, e.level, e.date," +
    " e.registrationCloses, COUNT(en), e.maxParticipants, e.isHidden, COUNT(f.approved))" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'COMPLETED' OR en.status = 'AWAITING_PAYMENT' OR en.status = 'AWAITING_APPROVAL' OR en.status = 'EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT'" +
    " LEFT JOIN en.freeEnrollment f ON (f.approved IS NULL OR f.approved = false) AND en.status = 'AWAITING_APPROVAL'" +
    " GROUP BY e.id"
  )
  List<ClerkExamEventProjection> listClerkExamEventProjections();
}
