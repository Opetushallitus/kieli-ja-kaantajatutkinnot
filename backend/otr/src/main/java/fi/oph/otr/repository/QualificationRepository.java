package fi.oph.otr.repository;

import fi.oph.otr.model.ExaminationType;
import fi.oph.otr.model.Qualification;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QualificationRepository extends BaseRepository<Qualification> {
  @Query(
    "SELECT q" +
    " FROM Qualification q" +
    " JOIN q.interpreter i" +
    " WHERE q.deletedAt IS NULL" +
    " AND i.deletedAt IS NULL"
  )
  List<Qualification> findExistingQualifications();

  @Query(
    "SELECT new fi.oph.otr.repository.InterpreterQualificationProjection(i.id, q.fromLang, q.toLang)" +
    " FROM Qualification q" +
    " JOIN q.interpreter i" +
    " WHERE q.beginDate <= CURRENT_DATE" +
    " AND CURRENT_DATE <= q.endDate" +
    " AND q.permissionToPublish = true" +
    " AND q.deletedAt IS NULL" +
    " AND i.deletedAt IS NULL" +
    " GROUP BY i.id, q.fromLang, q.toLang"
  )
  List<InterpreterQualificationProjection> findQualificationsForPublicListing();

  @Query(
    "SELECT q" +
    " FROM Qualification q" +
    " JOIN q.interpreter i" +
    " LEFT JOIN q.reminders qr" +
    " WHERE q.endDate BETWEEN ?1 AND ?2" +
    " AND q.deletedAt IS NULL" +
    " AND i.deletedAt IS NULL" +
    " GROUP BY q.id, qr.id" +
    " HAVING COUNT(qr.id) = 0 OR MAX(qr.createdAt) < ?3"
  )
  List<Qualification> findExpiringQualifications(
    LocalDate betweenStart,
    LocalDate betweenEnd,
    LocalDateTime previousReminderSentBefore
  );

  @Query(
    "SELECT q" +
    " FROM Qualification q" +
    " WHERE q.interpreter.id = ?1" +
    " AND q.examinationType = ?2" +
    " AND q.fromLang = ?3" +
    " AND q.toLang = ?4"
  )
  List<Qualification> findMatchingQualifications(
    long interpreterId,
    ExaminationType examinationType,
    String fromLang,
    String toLang
  );
}
