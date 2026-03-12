package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  @Query(value = "SELECT exam_session_registration_open(:examSessionId)", nativeQuery = true)
  boolean isRegistrationOpen(@Param("examSessionId") Long examSessionId);
}
