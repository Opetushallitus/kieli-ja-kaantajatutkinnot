package fi.oph.otr.model;

import fi.oph.otr.model.feature.Mutable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "region", uniqueConstraints = @UniqueConstraint(columnNames = { "interpreter_id", "code" }))
public class Sijainti extends Mutable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "region_id", nullable = false)
  private long id;

  @Column(name = "code", nullable = false)
  private String code;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "interpreter_id", referencedColumnName = "interpreter_id", nullable = false)
  private Tulkki interpreter;
}
