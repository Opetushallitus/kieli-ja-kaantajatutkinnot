package fi.oph.otr.model;

import static lombok.AccessLevel.PROTECTED;

import java.io.Serializable;
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
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 12.53
 */
@Entity
@Immutable
@Getter
@Setter
@NoArgsConstructor(access = PROTECTED)
@Table(
  name = "sijainti",
  schema = "public",
  // FIXME There is no such constraint in database. Remove this constraint from annotation, or add constraint to database.
  uniqueConstraints = @UniqueConstraint(columnNames = { "oikeustulkki", "tyyppi", "koodi" })
)
public class Sijainti implements Serializable {

  public enum Tyyppi {
    MAAKUNTA,
    KOKO_SUOMI,
  }

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sijainti_id_seq")
  //  @SequenceGenerator(name = "sijainti_id_seq", sequenceName = "sijainti_id_seq", allocationSize = 1)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "oikeustulkki", nullable = false)
  private Oikeustulkki oikeustulkki;

  @Enumerated(EnumType.STRING)
  @Column(name = "tyyppi", nullable = false)
  private Tyyppi tyyppi = Tyyppi.MAAKUNTA;

  @Column(name = "koodi")
  private String koodi;

  public Sijainti(Oikeustulkki oikeustulkki, Tyyppi tyyppi) {
    this.oikeustulkki = oikeustulkki;
    this.tyyppi = tyyppi;
  }

  public Sijainti(Oikeustulkki oikeustulkki, Tyyppi tyyppi, String koodi) {
    this.oikeustulkki = oikeustulkki;
    this.tyyppi = tyyppi;
    this.koodi = koodi;
  }
}
