package fi.oph.otr.repository;

import fi.oph.otr.model.Tulkki;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterpreterRepository extends JpaRepository<Tulkki, Long> {}
