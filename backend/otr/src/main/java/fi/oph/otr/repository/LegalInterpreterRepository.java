package fi.oph.otr.repository;

import fi.oph.otr.model.Oikeustulkki;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalInterpreterRepository extends JpaRepository<Oikeustulkki, Long> {}
