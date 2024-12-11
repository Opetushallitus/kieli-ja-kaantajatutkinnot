package fi.oph.vkt.repository;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminerExamEventRepository extends BaseRepository<ExaminerExamEvent> {
  Optional<ExaminerExamEvent> findById(long id);
  List<ExaminerExamEvent> findAllByExaminer(Examiner examiner);
}
