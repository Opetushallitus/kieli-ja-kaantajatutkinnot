package fi.oph.vkt.repository;

import fi.oph.vkt.model.Municipality;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface MunicipalityRepository extends BaseRepository<Municipality> {
  Optional<Municipality> findByCode(String code);
}
