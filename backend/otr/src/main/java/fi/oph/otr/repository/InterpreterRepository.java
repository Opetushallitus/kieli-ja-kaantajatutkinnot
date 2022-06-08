package fi.oph.otr.repository;

import fi.oph.otr.model.Interpreter;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InterpreterRepository extends JpaRepository<Interpreter, Long> {
  @Query("SELECT i.onrId FROM Interpreter i")
  List<String> listAllOnrIds();
}
