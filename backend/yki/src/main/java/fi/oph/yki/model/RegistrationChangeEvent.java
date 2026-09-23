package fi.oph.yki.model;

import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "registration_change_event")
public class RegistrationChangeEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "event", nullable = false)
  private String event;

  @Column(name = "registration_id", nullable = false)
  private long registrationId;

  @Column(name = "exam_session_id", nullable = false)
  private long examSessionId;

  @Column(name = "registration_state", nullable = false)
  @Enumerated
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationState registrationState;

  @Column(name = "registration_kind", nullable = false)
  @Enumerated
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationKind registrationKind;

  @Column(name = "original_exam_session_id")
  private Long originalExamSessionId;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "author_type", nullable = false)
  private String authorType;
}
