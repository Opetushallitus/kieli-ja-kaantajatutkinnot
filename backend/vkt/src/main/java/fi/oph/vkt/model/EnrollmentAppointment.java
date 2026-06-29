package fi.oph.vkt.model;

import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
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
@Table(name = "enrollment_appointment")
public class EnrollmentAppointment extends EnrollmentCommon {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_appointment_id", nullable = false)
  private long id;

  @Column(name = "status", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private EnrollmentAppointmentStatus status;

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

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "partial_exam_selection")
  private String partialExamSelection;

  @Column(name = "has_previous_enrollment", nullable = false)
  private boolean hasPreviousEnrollment;

  @Column(name = "previous_enrollment")
  private String previousEnrollment;

  @Column(name = "message")
  private String message;

  @Size(max = 255)
  @Column(name = "payment_link_hash", unique = true)
  private String paymentLinkHash;

  @Size(max = 255)
  @Column(name = "auth_hash", unique = true)
  private String authHash;

  @Column(name = "auth_hash_expires", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "auth_hash_sent", nullable = false)
  private LocalDateTime sentAt;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "grade_id", referencedColumnName = "grade_id")
  private EnrollmentGrade grade;

  @OneToMany(mappedBy = "enrollmentAppointment")
  private List<Payment> payments = new ArrayList<>();

  @OneToMany(mappedBy = "enrollmentAppointment")
  private List<ContactAttachment> attachments = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "examiner_id", referencedColumnName = "examiner_id")
  private Examiner examiner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "examiner_exam_event_id", referencedColumnName = "examiner_exam_event_id")
  private ExaminerExamEvent examinerExamEvent;
}
