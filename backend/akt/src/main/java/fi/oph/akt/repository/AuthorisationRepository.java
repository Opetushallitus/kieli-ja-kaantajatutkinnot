package fi.oph.akt.repository;

import fi.oph.akt.model.Authorisation;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorisationRepository extends JpaRepository<Authorisation, Long> {
  @Query(
    "SELECT new fi.oph.akt.repository.AuthorisationProjection(a.id, a.version, a.translator.id, a.basis," +
    " a.diaryNumber, a.fromLang, a.toLang, a.permissionToPublish, a.termBeginDate, a.termEndDate, e.date)" +
    " FROM Authorisation a" +
    " LEFT JOIN a.examinationDate e"
  )
  List<AuthorisationProjection> listAuthorisationProjections();

  @Query(
    "SELECT new fi.oph.akt.repository.TranslatorLanguagePairProjection(t.id, a.fromLang, a.toLang)" +
    " FROM Authorisation a" +
    " JOIN a.translator t" +
    " WHERE t.isAssuranceGiven = true AND a.permissionToPublish = true" +
    " AND a.termBeginDate IS NOT NULL AND CURRENT_DATE >= a.termBeginDate" +
    " AND (a.termEndDate IS NULL OR CURRENT_DATE <= a.termEndDate)" +
    " GROUP BY t.id, a.fromLang, a.toLang"
  )
  List<TranslatorLanguagePairProjection> findTranslatorLanguagePairsForPublicListing();

  @Query(
    "SELECT a.id" +
    " FROM Authorisation a" +
    " JOIN a.translator t" +
    " LEFT JOIN a.reminders atr" +
    " WHERE t.email IS NOT NULL" +
    " AND a.termEndDate IS NOT NULL" +
    " AND a.termEndDate BETWEEN ?1 AND ?2" +
    " GROUP BY a.id, atr.id" +
    " HAVING COUNT(atr.id) = 0 OR MAX(atr.createdAt) < ?3"
  )
  List<Long> findExpiringAuthorisations(
    LocalDate betweenStart,
    LocalDate betweenEnd,
    LocalDateTime previousReminderSentBefore
  );

  @Query("SELECT DISTINCT a.fromLang FROM Authorisation a ORDER BY a.fromLang")
  List<String> getDistinctFromLangs();

  @Query("SELECT DISTINCT a.toLang FROM Authorisation a ORDER BY a.toLang")
  List<String> getDistinctToLangs();
}
