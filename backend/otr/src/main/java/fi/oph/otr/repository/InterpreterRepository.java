package fi.oph.otr.repository;

import fi.oph.otr.model.Interpreter;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InterpreterRepository extends BaseRepository<Interpreter> {
  @Query("SELECT i FROM Interpreter i WHERE i.deletedAt IS NULL")
  List<Interpreter> findExistingInterpreters();

  @Query("SELECT i.onrId FROM Interpreter i WHERE i.deletedAt IS NULL")
  List<String> listExistingOnrIds();
}
