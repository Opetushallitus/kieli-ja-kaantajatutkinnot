package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "participant_sync_status")
public class ParticipantSyncStatus {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", nullable = false)
  private ExamSession examSession;

  @Column(name = "success_at")
  private LocalDateTime successAt;

  @Column(name = "failed_at")
  private LocalDateTime failedAt;

  @Column(name = "relocated_at")
  private LocalDateTime relocatedAt;

  @Column(name = "created", insertable = false, updatable = false)
  private LocalDateTime created;
}
