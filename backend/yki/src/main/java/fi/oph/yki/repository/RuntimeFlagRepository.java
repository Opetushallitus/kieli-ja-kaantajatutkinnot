package fi.oph.yki.repository;

import fi.oph.yki.model.RuntimeFlag;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RuntimeFlagRepository extends JpaRepository<RuntimeFlag, String> {
  /**
   * Reads a flag and holds a share lock on it until the transaction ends, so that changing the flag
   * waits for every transaction that has acted on its old value to commit.
   */
  @Query(value = "SELECT value FROM runtime_flag WHERE name = :name FOR SHARE", nativeQuery = true)
  Optional<String> findValueForShare(@Param("name") String name);
}
