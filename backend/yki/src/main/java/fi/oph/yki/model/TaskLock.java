package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "task_lock")
public class TaskLock {

  @Id
  @Column(name = "task")
  private String task;

  @Column(name = "last_executed")
  private LocalDateTime lastExecuted;

  @Column(name = "worker_id")
  private String workerId;
}
