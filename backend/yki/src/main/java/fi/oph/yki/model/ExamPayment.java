package fi.oph.yki.model;

import fi.oph.yki.model.type.PaymentState;
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
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_payment_new")
public class ExamPayment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "state")
  private PaymentState state;

  @Column(name = "paid_at")
  private LocalDateTime paidAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "registration_id")
  private Registration registration;
}
