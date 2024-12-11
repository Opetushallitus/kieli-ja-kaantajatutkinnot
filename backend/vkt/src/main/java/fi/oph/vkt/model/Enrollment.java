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
public class Enrollment extends EnrollmentCommon {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "enrollment_id", nullable = false)
  private long id;

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

  @Column(name = "is_queued")
  private Boolean isQueued;

  @Column(name = "payment_link_expires_at")
  private LocalDateTime paymentLinkExpiresAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exam_event_id", referencedColumnName = "exam_event_id", nullable = false)
  private ExamEvent examEvent;

  @OneToMany(mappedBy = "enrollment")
  private List<Payment> payments = new ArrayList<>();

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "free_enrollment", referencedColumnName = "free_enrollment_id")
  private FreeEnrollment freeEnrollment;

  public boolean isCancelled() {
    return this.status == EnrollmentStatus.CANCELED || this.status == EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT;
  }

  public boolean isExpectingPayment() {
    return this.status == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT;
  }

  public boolean isUnfinished() {
    return (
      this.status == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT ||
      this.status == EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT
    );
  }

  public boolean enrollmentNeedsApproval() {
    return (this.getFreeEnrollment() != null && this.getFreeEnrollment().getApproved() == null);
  }

  public boolean hasApplicableFreeBasis() {
    // Approval may be undecided (null) in which case
    // it is assumed as valid
    return (
      this.getFreeEnrollment() != null &&
      (this.getFreeEnrollment().getApproved() == null || this.getFreeEnrollment().getApproved())
    );
  }
}
