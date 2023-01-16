package fi.oph.akr.repository;

import fi.oph.akr.model.ExaminationDate;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminationDateRepository extends BaseRepository<ExaminationDate> {
  List<ExaminationDate> findAllByOrderByDateDesc();
}
