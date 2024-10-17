package fi.oph.vkt.repository;

import fi.oph.vkt.model.Examiner;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminerRepository extends BaseRepository<Examiner> {
  List<Examiner> getAllByDeletedAtIsNull();
  Examiner getByOid(String oid);

  @Query("SELECT e.oid FROM Examiner e WHERE e.deletedAt IS NULL")
  List<String> listExistingOnrIds();
}
