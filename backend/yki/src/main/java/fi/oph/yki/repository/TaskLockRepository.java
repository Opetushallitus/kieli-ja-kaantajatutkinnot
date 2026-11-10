package fi.oph.yki.repository;

import fi.oph.yki.model.TaskLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLockRepository extends JpaRepository<TaskLock, String> {
  @Query(
    value = "SELECT EXTRACT(EPOCH FROM ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - last_executed)) FROM task_lock WHERE task = :task",
    nativeQuery = true
  )
  Double findAgeInSeconds(@Param("task") String task);
}
