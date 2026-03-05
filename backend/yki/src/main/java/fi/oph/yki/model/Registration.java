package fi.oph.yki.model;

import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "registration")
public class Registration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "person_oid", referencedColumnName = "oid")
  private Person person;

  @Column(name = "kind")
  @Enumerated
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationKind kind;

  @Column(name = "state", columnDefinition = "registration_state")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationState state;

  @Column(name = "partial_exam_type", columnDefinition = "exam_session_ticket_type")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private PartialExamType partialExamType;

  @Column(name = "lifted_from_queue_at")
  private LocalDateTime liftedFromQueueAt;

  @Column(name = "created")
  private LocalDateTime createdAt;

  @Column(name = "expires_at")
  private LocalDateTime expiresAt;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", referencedColumnName = "id")
  private ExamSession examSession;

  // DO NOT REMOVE THE fetch=FetchType.LAZY ANNOTATION unless extremely confident that things will not break!
  // IDEA will falsely claim that it will not affect loading - this is not so.
  @OneToOne(fetch = FetchType.LAZY, mappedBy = "registration", optional = false)
  private FreeRegistration freeRegistration;

  @OneToMany(mappedBy = "registration")
  private List<ExamPayment> examPayments = new ArrayList<>();

  @OneToOne(fetch = FetchType.LAZY, mappedBy = "registration", optional = false)
  private RegistrationEvaluation evaluation;
}
