package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import java.util.List;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  boolean existsByExamDateId(long examDateId);

  List<ExamSession> findByOrganizer(final Organizer organizer);
}
