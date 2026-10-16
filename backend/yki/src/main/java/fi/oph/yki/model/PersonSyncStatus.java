package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "person_sync_status")
public class PersonSyncStatus {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "person_oid")
  private String personOid;

  @Column(name = "success_at")
  private LocalDateTime successAt;

  @Column(name = "failed_at")
  private LocalDateTime failedAt;

  @Column(name = "should_retry")
  private Boolean shouldRetry;

  @Column(name = "created", insertable = false, updatable = false)
  private LocalDateTime created;
}
