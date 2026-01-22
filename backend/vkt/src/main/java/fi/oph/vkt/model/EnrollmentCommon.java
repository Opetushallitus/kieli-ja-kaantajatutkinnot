package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class EnrollmentCommon extends BaseEntity {

  @Column(name = "skill_oral")
  private boolean oralSkill;

  @Column(name = "skill_textual")
  private boolean textualSkill;

  @Column(name = "skill_understanding")
  private boolean understandingSkill;

  @Column(name = "partial_exam_speaking")
  private boolean speakingPartialExam;

  @Column(name = "partial_exam_speech_comprehension")
  private boolean speechComprehensionPartialExam;

  @Column(name = "partial_exam_writing")
  private boolean writingPartialExam;

  @Column(name = "partial_exam_reading_comprehension")
  private boolean readingComprehensionPartialExam;

  @Column(name = "last_sync_at")
  private LocalDateTime lastSyncAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;
}
