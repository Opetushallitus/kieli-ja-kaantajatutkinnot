package fi.oph.yki.repository;

import fi.oph.yki.model.TaskLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLockRepository extends JpaRepository<TaskLock, String> {
  // Computed by Postgres itself so staleness checks aren't thrown off by any mismatch between
  // the JVM's and the database's configured timezone (see ScheduledTaskMonitor). Null if the
  // task has no row yet.
  @Query(
    value = "SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_executed)) FROM task_lock WHERE task = :task",
    nativeQuery = true
  )
  Double findAgeInSeconds(@Param("task") String task);
}
