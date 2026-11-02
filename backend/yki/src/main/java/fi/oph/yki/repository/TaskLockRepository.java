package fi.oph.yki.repository;

import fi.oph.yki.model.TaskLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface TaskLockRepository extends JpaRepository<TaskLock, String> {
  @Query(
    value = "SELECT EXTRACT(EPOCH FROM ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - last_executed)) FROM task_lock WHERE task = :task",
    nativeQuery = true
  )
  Double findAgeInSeconds(@Param("task") String task);

  @Modifying
  @Transactional
  @Query(
    value = "UPDATE task_lock SET last_executed = CURRENT_TIMESTAMP, worker_id = :workerId WHERE task = :task AND last_executed < (CURRENT_TIMESTAMP - CAST(:interval AS interval))",
    nativeQuery = true
  )
  int tryToAcquireLock(
    @Param("task") String task,
    @Param("workerId") String workerId,
    @Param("interval") String interval
  );
}
