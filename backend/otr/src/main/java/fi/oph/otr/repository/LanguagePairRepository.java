package fi.oph.otr.repository;

import fi.oph.otr.model.LanguagePair;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LanguagePairRepository extends JpaRepository<LanguagePair, Long> {
  @Query(
    "SELECT new fi.oph.otr.repository.InterpreterLanguagePairProjection(i.id, lp.fromLang, lp.toLang) FROM LanguagePair lp" +
    " JOIN lp.qualification q" +
    " JOIN q.interpreter i" +
    " WHERE lp.beginDate <= CURRENT_DATE" +
    " AND CURRENT_DATE <= lp.endDate" +
    " AND q.permissionToPublish = true" +
    " AND q.deletedAt IS NULL" +
    " AND i.deletedAt IS NULL"
  )
  List<InterpreterLanguagePairProjection> findLanguagePairsForPublicListing();
}
