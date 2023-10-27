package fi.oph.akr.repository;

import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorisationRepository extends BaseRepository<Authorisation> {
  @Query(
    "SELECT new fi.oph.akr.repository.AuthorisationProjection(a.id, a.version, a.translator.id, a.basis," +
    " a.diaryNumber, a.fromLang, a.toLang, a.permissionToPublish, a.termBeginDate, a.termEndDate, e.date)" +
    " FROM Authorisation a" +
    " LEFT JOIN a.examinationDate e"
  )
  List<AuthorisationProjection> listAuthorisationProjections();

  @Query(
    "SELECT new fi.oph.akr.repository.TranslatorLanguagePairProjection(t.id, a.fromLang, a.toLang)" +
    " FROM Authorisation a" +
    " JOIN a.translator t" +
    " WHERE t.isAssuranceGiven = true AND a.permissionToPublish = true" +
    " AND a.termBeginDate IS NOT NULL AND CURRENT_DATE >= a.termBeginDate" +
    " AND (a.termEndDate IS NULL OR CURRENT_DATE <= a.termEndDate)" +
    " GROUP BY t.id, a.fromLang, a.toLang"
  )
  List<TranslatorLanguagePairProjection> findTranslatorLanguagePairsForPublicListing();

  @Query(
    "SELECT a" +
    " FROM Authorisation a" +
    " LEFT JOIN a.reminders atr" +
    " WHERE a.termEndDate IS NOT NULL" +
    " AND a.termEndDate BETWEEN ?1 AND ?2" +
    " GROUP BY a.id, atr.id" +
    " HAVING COUNT(atr.id) = 0 OR MAX(atr.createdAt) < ?3"
  )
  List<Authorisation> findExpiringAuthorisations(
    LocalDate betweenStart,
    LocalDate betweenEnd,
    LocalDateTime previousReminderSentBefore
  );

  @Query(
    "SELECT a" +
    " FROM Authorisation a" +
    " WHERE a.translator.id = ?1" +
    " AND a.basis = ?2" +
    " AND a.fromLang = ?3" +
    " AND a.toLang = ?4"
  )
  List<Authorisation> findMatchingAuthorisations(
    long translatorId,
    AuthorisationBasis basis,
    String fromLang,
    String toLang
  );

  @Query("SELECT DISTINCT a.fromLang FROM Authorisation a ORDER BY a.fromLang")
  List<String> getDistinctFromLangs();

  @Query("SELECT DISTINCT a.toLang FROM Authorisation a ORDER BY a.toLang")
  List<String> getDistinctToLangs();
}
