package fi.oph.vkt.model;

import fi.oph.vkt.model.type.EnrollmentGradeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "enrollment_grade")
public class EnrollmentGrade {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "grade_id", nullable = false)
  private long id;

  @Column(name = "speaking_grade")
  private EnrollmentGradeType speakingPartialExamGrade;

  @Column(name = "speech_comprehension_grade")
  private EnrollmentGradeType speechComprehensionPartialExamGrade;

  @Column(name = "writing_grade")
  private EnrollmentGradeType writingPartialExamGrade;

  @Column(name = "comprehension_grade")
  private EnrollmentGradeType readingComprehensionPartialExamGrade;

  @Column(name = "speaking_comment")
  private String speakingPartialExamComment;

  @Column(name = "speech_comprehension_comment")
  private String speechComprehensionPartialExamComment;

  @Column(name = "writing_comment")
  private String writingPartialExamComment;

  @Column(name = "comprehension_comment")
  private String readingComprehensionPartialExamComment;

  @OneToOne(mappedBy = "grade")
  private EnrollmentAppointment enrollmentAppointment;
}
