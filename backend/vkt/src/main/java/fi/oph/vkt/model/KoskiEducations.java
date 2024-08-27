package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "koski_educations")
public class KoskiEducations {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "koski_educations_id", nullable = false)
  private Long koskiEducationsId;

  @Column(name = "free_enrollment_id")
  private Long freeEnrollmentId;

  @Column(name = "exam_event_id", nullable = false)
  private Long examEventId;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "matriculation_exam", nullable = false)
  private Boolean matriculationExam;

  @Column(name = "higher_education_concluded", nullable = false)
  private Boolean higherEducationConcluded;

  @Column(name = "higher_education_enrolled", nullable = false)
  private Boolean higherEducationEnrolled;

  @Column(name = "eb", nullable = false)
  private Boolean eb;

  @Column(name = "dia", nullable = false)
  private Boolean dia;

  @Column(name = "other", nullable = false)
  private Boolean other;

  @PrePersist
  protected void prePersist() {
    final LocalDateTime now = LocalDateTime.now();
    setCreatedAt(now);
  }
}
