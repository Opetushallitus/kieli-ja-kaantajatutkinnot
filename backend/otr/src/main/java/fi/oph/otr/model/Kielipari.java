package fi.oph.otr.model;

import static lombok.AccessLevel.PROTECTED;

import fi.oph.otr.model.embeddable.Kieli;
import java.io.Serializable;
import java.time.LocalDate;
import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Entity;
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

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 12.47
 */
@Entity
@Getter
@Setter
@NoArgsConstructor(access = PROTECTED)
@Table(
  name = "kielipari",
  schema = "public",
  uniqueConstraints = @UniqueConstraint(columnNames = { "oikeustulkki", "kielesta", "kieleen" })
)
public class Kielipari implements Serializable {

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "kielipari_id_seq")
  //  @SequenceGenerator(name = "kielipari_id_seq", sequenceName = "kielipari_id_seq", allocationSize = 1)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "oikeustulkki", nullable = false)
  private Oikeustulkki oikeustulkki;

  @Column(name = "voimassaolo_alkaa", nullable = false)
  private LocalDate voimassaoloAlkaa;

  @Column(name = "voimassaolo_paattyy", nullable = false)
  private LocalDate voimassaoloPaattyy;

  @AttributeOverrides(
    @AttributeOverride(name = "koodi", column = @Column(name = "kielesta", nullable = false, updatable = false))
  )
  private Kieli kielesta;

  @AttributeOverrides(
    @AttributeOverride(name = "koodi", column = @Column(name = "kieleen", nullable = false, updatable = false))
  )
  private Kieli kieleen;

  public Kielipari(
    Oikeustulkki oikeustulkki,
    Kieli kielesta,
    Kieli kieleen,
    LocalDate voimassaoloAlkaa,
    LocalDate voimassaoloPaattyy
  ) {
    this.oikeustulkki = oikeustulkki;
    this.kielesta = kielesta;
    this.kieleen = kieleen;
    this.voimassaoloAlkaa = voimassaoloAlkaa;
    this.voimassaoloPaattyy = voimassaoloPaattyy;
  }
}
