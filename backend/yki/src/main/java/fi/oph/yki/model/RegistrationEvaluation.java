package fi.oph.yki.model;

import fi.oph.yki.model.type.EvaluationState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "registration_evaluation")
public class RegistrationEvaluation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "registration_evaluation_id", nullable = false)
  private long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "registration_id", referencedColumnName = "id")
  private Registration registration;

  @Column(name = "state")
  @Enumerated
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private EvaluationState state;
}
