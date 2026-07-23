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
@Table(name = "exam_session_statistics")
public class ExamSessionStatistics {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", nullable = false)
  private ExamSession examSession;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "participants", nullable = false)
  private Integer participants;

  @Column(name = "queue", nullable = false)
  private Integer queue;

  @Column(name = "max_participant_count", nullable = false)
  private Integer maxParticipantCount;

  @Column(name = "max_queue_count", nullable = false)
  private Integer maxQueueCount;

  @Column(name = "max_participants_at", nullable = false)
  private LocalDateTime maxParticipantsAt;

  @Column(name = "max_queue_at", nullable = false)
  private LocalDateTime maxQueueAt;

  @Column(name = "last_processed_event_id")
  private Long lastProcessedEventId;
}
