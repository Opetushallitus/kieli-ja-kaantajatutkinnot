package fi.oph.vkt.model;

import fi.oph.vkt.model.type.PaymentStatus;
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
@Table(name = "payment")
public class Payment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "payment_id", nullable = false)
  private long paymentId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "enrollment_id", referencedColumnName = "enrollment_id", nullable = false)
  private Enrollment enrollment;

  @Column(name = "transaction_id")
  private String transactionId;

  @Column(name = "reference")
  private String reference;

  @Column(name = "payment_url")
  private String paymentUrl;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status")
  private PaymentStatus paymentStatus;
}
