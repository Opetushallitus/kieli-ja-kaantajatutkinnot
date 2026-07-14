package fi.oph.yki.repository;

import fi.oph.yki.model.Evaluation;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
  List<Evaluation> findByDeletedAtIsNull();

  List<Evaluation> findByDeletedAtIsNullAndEvaluationEndDateGreaterThanEqual(LocalDate date);

  Optional<Evaluation> findByIdAndDeletedAtIsNull(long id);

  List<Evaluation> findByExamDateId(long examDateId);

  boolean existsByExamDateIdAndDeletedAtIsNull(long examDateId);
}
