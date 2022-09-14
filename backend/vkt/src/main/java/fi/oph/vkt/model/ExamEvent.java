package fi.oph.vkt.model;

import fi.oph.vkt.model.exam.ExamLanguage;
import fi.oph.vkt.model.exam.ExamLevel;
import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_event")
public class ExamEvent extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "exam_event_id", nullable = false)
  private long id;

  @Column(name = "language", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private ExamLanguage language;

  @Column(name = "level", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private ExamLevel level;

  @Column(name = "date", nullable = false)
  private LocalDate date;

  @Column(name = "registration_closes", nullable = false)
  private LocalDate registrationCloses;

  @Column(name = "is_visible", nullable = false)
  private boolean isVisible;

  @Column(name = "max_participants", nullable = false)
  private int maxParticipants;
}
