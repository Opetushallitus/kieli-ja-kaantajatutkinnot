package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contact_attachment")
public class ContactAttachment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "attachment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "enrollment_appointment_id", referencedColumnName = "enrollment_appointment_id", nullable = false)
  private EnrollmentAppointment enrollmentAppointment;

  @Column(name = "key", nullable = false)
  private String key;

  @Column(name = "filename", nullable = false)
  private String filename;

  @Column(name = "size", nullable = false)
  private int size;
}
