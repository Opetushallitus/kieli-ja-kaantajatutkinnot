package fi.oph.otr.model;

import fi.oph.otr.model.feature.Mutable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 11.08
 */
@Entity
@Immutable
@Getter
@Setter
@Table(name = "tulkki", schema = "public")
public class Tulkki extends Mutable {

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tulkki_id_seq")
  //  @SequenceGenerator(name = "tulkki_id_seq", sequenceName = "tulkki_id_seq", allocationSize = 1)
  private Long id;

  @Column(name = "henkilo_oid", nullable = false, unique = true, updatable = false)
  private String henkiloOid;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "tulkki", cascade = CascadeType.ALL)
  private Set<Oikeustulkki> oikeustulkit = new HashSet<>(0);

  protected Tulkki() {}

  public Tulkki(String oid) {
    this.henkiloOid = oid;
  }
}
