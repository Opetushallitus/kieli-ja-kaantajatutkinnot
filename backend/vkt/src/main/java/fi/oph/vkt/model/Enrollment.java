package fi.oph.vkt.model;

import fi.oph.vkt.model.type.EnrollmentStatus;
import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "enrollment")
public class Enrollment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_id", nullable = false)
  private long id;

  @Column(name = "skill_oral", nullable = false)
  private boolean oralSkill;

  @Column(name = "skill_textual", nullable = false)
  private boolean textualSkill;

  @Column(name = "skill_understanding", nullable = false)
  private boolean understandingSkill;

  @Column(name = "partial_exam_speaking", nullable = false)
  private boolean speakingPartialExam;

  @Column(name = "partial_exam_speech_comprehension", nullable = false)
  private boolean speechComprehensionPartialExam;

  @Column(name = "partial_exam_writing", nullable = false)
  private boolean writingPartialExam;

  @Column(name = "partial_exam_reading_comprehension", nullable = false)
  private boolean readingComprehensionPartialExam;

  @Column(name = "status", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private EnrollmentStatus status;

  @Column(name = "previous_enrollment_date")
  private LocalDate previousEnrollmentDate;

  @Column(name = "digital_certificate_consent", nullable = false)
  private boolean digitalCertificateConsent;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exam_event_id", referencedColumnName = "exam_event_id", nullable = false)
  private ExamEvent examEvent;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;
}