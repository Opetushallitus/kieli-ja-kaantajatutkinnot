package fi.oph.vkt.model;

import fi.oph.vkt.model.type.EnrollmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

  @Column(name = "previous_enrollment")
  private String previousEnrollment;

  @Column(name = "digital_certificate_consent", nullable = false)
  private boolean digitalCertificateConsent;

  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "phone_number", nullable = false)
  private String phoneNumber;

  @Column(name = "street")
  private String street;

  @Column(name = "postal_code")
  private String postalCode;

  @Column(name = "town")
  private String town;

  @Column(name = "country")
  private String country;

  @Size(max = 255)
  @Column(name = "payment_link_hash", unique = true)
  private String paymentLinkHash;

  @Column(name = "payment_link_expires_at")
  private LocalDateTime paymentLinkExpiresAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exam_event_id", referencedColumnName = "exam_event_id", nullable = false)
  private ExamEvent examEvent;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;

  @OneToMany(mappedBy = "enrollment")
  private List<Payment> payments = new ArrayList<>();

  public boolean isCancelled() {
    return this.status == EnrollmentStatus.CANCELED || this.status == EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT;
  }
}
