package fi.oph.otr.repository;

import fi.oph.otr.model.Qualification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QualificationRepository extends JpaRepository<Qualification, Long> {
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
}
