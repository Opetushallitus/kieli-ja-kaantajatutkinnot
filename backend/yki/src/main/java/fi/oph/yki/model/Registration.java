package fi.oph.yki.model;

import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.persistence.*;
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
  @Enumerated
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private RegistrationState state;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", referencedColumnName = "id")
  private ExamSession examSession;

  @OneToOne(fetch = FetchType.LAZY, mappedBy = "registration", cascade = CascadeType.ALL)
  private FreeRegistration freeRegistration;
}
