package fi.oph.yki.model;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.model.type.LoginLinkType;
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
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "login_link")
public class LoginLink {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "code", nullable = false, unique = true)
  private String code;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "participant_id", referencedColumnName = "id")
  private Participant participant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", referencedColumnName = "id")
  private ExamSession examSession;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "registration_id", referencedColumnName = "id")
  private Registration registration;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private LoginLinkType type;

  @Column(name = "expired_link_redirect", nullable = false)
  private String expiredLinkRedirect;

  @Column(name = "success_redirect", nullable = false)
  private String successRedirect;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "user_data")
  private ObjectNode userData;

  @Column(name = "created")
  private LocalDateTime createdAt;

  @Column(name = "modified")
  private LocalDateTime modifiedAt;
}
