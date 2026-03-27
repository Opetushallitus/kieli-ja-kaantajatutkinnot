package fi.oph.yki.repository;

import fi.oph.yki.model.ExamDate;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamDateRepository extends JpaRepository<ExamDate, Long> {
  List<ExamDate> getByExamDateAfterAndDeletedAtIsNull(LocalDate date);

  List<ExamDate> findAllByDeletedAtIsNull();

  boolean existsByExamDateAndDeletedAtIsNull(LocalDate examDate);
}
