package fi.oph.otr.repository;

import fi.oph.otr.model.Oikeustulkki;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QualificationRepository extends JpaRepository<Oikeustulkki, Long> {}
