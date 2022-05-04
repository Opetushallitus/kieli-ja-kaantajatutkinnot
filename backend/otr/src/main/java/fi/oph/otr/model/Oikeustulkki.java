package fi.oph.otr.model;

import fi.oph.otr.model.feature.Mutable;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "qualification")
public class Oikeustulkki extends Mutable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "qualification_id", nullable = false)
  private long id;

  @Column(name = "examination_type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private QualificationExaminationType examinationType;

  @Column(name = "permission_to_publish", nullable = false)
  private boolean permissionToPublish;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "interpreter_id", referencedColumnName = "interpreter_id", nullable = false)
  private Tulkki interpreter;

  @OneToMany(mappedBy = "qualification")
  private List<Kielipari> languagePairs = new ArrayList<>();
}
