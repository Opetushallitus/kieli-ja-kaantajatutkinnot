package fi.oph.yki.repository;

import fi.oph.yki.model.EvaluationOrder;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationOrderRepository extends JpaRepository<EvaluationOrder, Long> {
  @EntityGraph(attributePaths = { "evaluation.examDateLanguage.examDate" })
  Optional<EvaluationOrder> findByIdAndDeletedAtIsNull(long id);
}
