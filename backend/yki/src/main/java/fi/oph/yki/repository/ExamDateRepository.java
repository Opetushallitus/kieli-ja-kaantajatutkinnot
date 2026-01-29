package fi.oph.yki.repository;

import fi.oph.yki.model.ExamDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamDateRepository extends JpaRepository<ExamDate, Long> {}
