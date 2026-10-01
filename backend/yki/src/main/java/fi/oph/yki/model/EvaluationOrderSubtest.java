package fi.oph.yki.model;

import fi.oph.yki.model.type.Subtest;
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

@Getter
@Setter
@Entity
@Table(name = "evaluation_order_subtest")
public class EvaluationOrderSubtest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "evaluation_order_id", nullable = false)
  private EvaluationOrder evaluationOrder;

  @Column(name = "subtest", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private Subtest subtest;
}
