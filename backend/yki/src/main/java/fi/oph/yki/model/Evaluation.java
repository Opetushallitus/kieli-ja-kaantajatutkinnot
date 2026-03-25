package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "evaluation")
public class Evaluation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_date_id", nullable = false)
  private ExamDate examDate;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_date_language_id", nullable = false)
  private ExamDateLanguage examDateLanguage;

  @Column(name = "evaluation_start_date", nullable = false)
  private LocalDate evaluationStartDate;

  @Column(name = "evaluation_end_date", nullable = false)
  private LocalDate evaluationEndDate;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;
}
