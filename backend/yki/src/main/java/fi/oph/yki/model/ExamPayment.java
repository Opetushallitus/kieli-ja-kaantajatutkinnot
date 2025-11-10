package fi.oph.yki.model;

import fi.oph.yki.model.type.PaymentState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    private LocalDate paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;
}
