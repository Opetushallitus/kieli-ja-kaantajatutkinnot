package fi.oph.yki.model;

import com.fasterxml.jackson.databind.node.ObjectNode;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;

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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "participant_id", referencedColumnName = "id")
  private Participant participant;

  // PostgreSQLEnumJdbcType binds by constant name whatever the EnumType, so this is spelled out
  // only to match state and partialExamType below and stop the bare @Enumerated reading as ordinal.
  @Column(name = "kind")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationKind kind;

  @Column(name = "state", columnDefinition = "registration_state")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationState state;

  @Column(name = "partial_exam_type")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private PartialExamType partialExamType;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "form")
  private ObjectNode form;

  @Column(name = "lifted_from_queue_at")
  private LocalDateTime liftedFromQueueAt;

  @Column(name = "created")
  private LocalDateTime createdAt;

  // Maintained by the database (column default) and by the queue-lifting UPDATE, which sets
  // current_timestamp the way the legacy backend's registration updates do. Mapped read-only so a
  // JPA save can neither null it on insert nor write back a value that went stale after a native
  // update.
  @Column(name = "modified", insertable = false, updatable = false)
  private LocalDateTime modifiedAt;

  /**
   * Language the participant used when submitting, and the language their emails are sent in.
   * Written alongside the rest of the form at the STARTED -> SUBMITTED transition, so it can be
   * null on registrations that never got that far.
   */
  @Column(name = "ui_language")
  private String uiLanguage;

  @Column(name = "expires_at")
  private LocalDateTime expiresAt;

  @Column(name = "strong_auth")
  private Boolean strongAuth;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", referencedColumnName = "id")
  private ExamSession examSession;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "original_exam_session_id", referencedColumnName = "id")
  private ExamSession originalExamSession;

  // DO NOT REMOVE THE fetch=FetchType.LAZY ANNOTATION unless extremely confident that things will not break!
  // IDEA will falsely claim that it will not affect loading - this is not so.
  @OneToOne(fetch = FetchType.LAZY, mappedBy = "registration", optional = false)
  private FreeRegistration freeRegistration;

  @OneToMany(mappedBy = "registration")
  private List<ExamPayment> examPayments = new ArrayList<>();

  @OneToOne(fetch = FetchType.LAZY, mappedBy = "registration", optional = false)
  private RegistrationEvaluation evaluation;
}
