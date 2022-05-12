package fi.oph.otr.repository;

import fi.oph.otr.model.Interpreter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterpreterRepository extends JpaRepository<Interpreter, Long> {}
