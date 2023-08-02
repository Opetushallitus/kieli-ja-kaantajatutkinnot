package fi.oph.vkt.model;

import fi.oph.vkt.model.type.PaymentStatus;
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
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "payment")
public class Payment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "payment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "enrollment_id", referencedColumnName = "enrollment_id", nullable = false)
  private Enrollment enrollment;

  @Column(name = "amount", nullable = false)
  private int amount;

  @Column(name = "transaction_id")
  private String transactionId;

  @Column(name = "reference")
  private String reference;

  @Column(name = "payment_url")
  private String paymentUrl;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status")
  private PaymentStatus paymentStatus;

  @Column(name = "refunded_at")
  private LocalDateTime refundedAt;
}
