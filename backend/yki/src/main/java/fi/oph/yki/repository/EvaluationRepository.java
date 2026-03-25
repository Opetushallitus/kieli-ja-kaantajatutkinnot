package fi.oph.yki.repository;

import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.ExamDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
  List<Evaluation> findByDeletedAtIsNull();

  boolean existsByExamDateAndDeletedAtIsNull(ExamDate examDate);
}
