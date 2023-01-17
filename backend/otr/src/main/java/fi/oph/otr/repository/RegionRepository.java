package fi.oph.otr.repository;

import fi.oph.otr.model.Region;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionRepository extends BaseRepository<Region> {
  @Query(
    "SELECT new fi.oph.otr.repository.InterpreterRegionProjection(i.id, r.code)" +
    " FROM Interpreter i" +
    " JOIN i.regions r"
  )
  List<InterpreterRegionProjection> listInterpreterRegionProjections();
}
