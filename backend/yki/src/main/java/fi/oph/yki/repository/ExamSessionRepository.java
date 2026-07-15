package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  List<ExamSession> findByOrganizerOid_Oid(String oid);

  boolean existsByExamDateId(long examDateId);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.registrations r" +
    " LEFT JOIN FETCH r.freeRegistration" +
    " LEFT JOIN FETCH r.evaluation" +
    " LEFT JOIN FETCH es.examDate" +
    " WHERE es.organizer = :organizer"
  )
  List<ExamSession> findByOrganizer(final Organizer organizer);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.registrations r" +
    " LEFT JOIN FETCH r.freeRegistration" +
    " LEFT JOIN FETCH r.evaluation" +
    " LEFT JOIN FETCH es.examDate ed" +
    " WHERE es.organizer = :organizer AND ed.examDate >= :from"
  )
  List<ExamSession> findByOrganizerAndExamDateFrom(final Organizer organizer, final LocalDate from);

  @Query("SELECT DISTINCT es FROM ExamSession es" + " LEFT JOIN FETCH es.locations r" + " WHERE es IN (:examSessions)")
  List<ExamSession> findByExamSessionsWithLocation(final List<ExamSession> examSessions);
}
