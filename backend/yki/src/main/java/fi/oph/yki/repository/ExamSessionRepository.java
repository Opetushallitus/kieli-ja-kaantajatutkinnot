package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  boolean existsByExamDateId(long examDateId);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.registrations r" +
    " LEFT JOIN FETCH r.freeRegistration" +
    " LEFT JOIN FETCH r.evaluation" +
    " WHERE es.organizer = :organizer"
  )
  List<ExamSession> findByOrganizer(final Organizer organizer);
}
