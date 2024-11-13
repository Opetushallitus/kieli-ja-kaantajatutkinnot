package fi.oph.vkt.repository;

import fi.oph.vkt.model.ExaminerExamEvent;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminerExamEventRepository extends BaseRepository<ExaminerExamEvent> {
  Optional<ExaminerExamEvent> findByOidAndExaminerExamEventId(String oid, long examinerExamEventId);
}
