package fi.oph.otr.repository;

import fi.oph.otr.model.Sijainti;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Sijainti, Long> {}
