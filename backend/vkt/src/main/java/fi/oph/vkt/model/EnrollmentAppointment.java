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
import jakarta.persistence.OneToOne;
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
public class EnrollmentAppointment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_appointment_id", nullable = false)
  private long id;

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

  @Column(name = "digital_certificate_consent")
  private boolean digitalCertificateConsent;

  @Column(name = "email")
  private String email;

  @Column(name = "phone_number")
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
  @Column(name = "auth_hash", unique = true)
  private String authHash;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id")
  private Person person;

  @OneToMany(mappedBy = "enrollmentAppointment")
  private List<Payment> payments = new ArrayList<>();
}
