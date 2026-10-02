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
@Table(name = "shedlock")
public class ShedLock {

  @Id
  @Column(name = "name")
  private String name;

  @Column(name = "locked_at")
  private LocalDateTime lockedAt;
}
