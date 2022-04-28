package fi.oph.akt.repository;

import fi.oph.akt.model.ExaminationDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminationDateRepository extends JpaRepository<ExaminationDate, Long> {
  List<ExaminationDate> findAllByOrderByDateDesc();
}
