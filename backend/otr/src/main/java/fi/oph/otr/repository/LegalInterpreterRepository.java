package fi.oph.otr.repository;

import fi.oph.otr.model.Oikeustulkki;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalInterpreterRepository extends JpaRepository<Oikeustulkki, Long> {}
