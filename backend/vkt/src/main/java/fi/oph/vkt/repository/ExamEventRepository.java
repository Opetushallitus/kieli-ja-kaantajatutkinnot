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
    " e.registrationOpens, COUNT(en), e.maxParticipants)" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'COMPLETED' OR en.status = 'AWAITING_PAYMENT' OR en.status = 'AWAITING_APPROVAL' OR en.status = 'EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT'" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_TIMESTAMP" +
    " AND e.isHidden = false" +
    " GROUP BY e.id"
  )
  List<PublicExamEventProjection> listPublicExamEventProjections(final ExamLevel level);

  @Query(
    "SELECT e.id" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'QUEUED'" +
    " WHERE e.level = ?1" +
    " AND e.registrationCloses >= CURRENT_TIMESTAMP" +
    " AND e.isHidden = false" +
    " GROUP BY e.id" +
    " HAVING COUNT(en) > 0"
  )
  Set<Long> listPublicExamEventIdsWithQueue(final ExamLevel level);

  @Query(
    "SELECT e.id" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'QUEUED'" +
    " WHERE e.level = ?1" +
    " GROUP BY e.id" +
    " HAVING COUNT(en) > 0"
  )
  Set<Long> listClerkExamEventIdsWithQueue(final ExamLevel level);

  @Query(
    "SELECT new fi.oph.vkt.repository.ClerkExamEventProjection(e.id, e.language, e.level, e.date," +
    " e.registrationCloses, e.registrationOpens, COUNT(en), e.maxParticipants, e.isHidden, COUNT(en.id) filter (where en.status = 'AWAITING_APPROVAL'))" +
    " FROM ExamEvent e" +
    " LEFT JOIN e.enrollments en ON en.status = 'COMPLETED' OR en.status = 'AWAITING_PAYMENT' OR en.status = 'AWAITING_APPROVAL' OR en.status = 'EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT'" +
    " WHERE e.level = ?1" +
    " GROUP BY e.id"
  )
  List<ClerkExamEventProjection> listClerkExamEventProjections(final ExamLevel level);
}
