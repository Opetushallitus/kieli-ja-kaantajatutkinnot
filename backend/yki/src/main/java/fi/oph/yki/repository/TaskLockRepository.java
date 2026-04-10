package fi.oph.yki.repository;

import fi.oph.yki.model.TaskLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLockRepository extends JpaRepository<TaskLock, String> {}
