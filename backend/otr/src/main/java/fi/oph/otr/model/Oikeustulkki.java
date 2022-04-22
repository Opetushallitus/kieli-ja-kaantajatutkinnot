package fi.oph.otr.model;

import fi.oph.otr.model.feature.Mutable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
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
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 12.41
 */
@Entity
@Getter
@Setter
@Table(name = "oikeustulkki", schema = "public")
public class Oikeustulkki extends Mutable {

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "oikeustulkki_id_seq")
  //  @SequenceGenerator(name = "oikeustulkki_id_seq", sequenceName = "oikeustulkki_id_seq", allocationSize = 1)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @JoinColumn(name = "tulkki", nullable = false)
  private Tulkki tulkki;

  @Enumerated(EnumType.STRING)
  @Column(name = "tutkinto_tyyppi", nullable = false)
  private TutkintoTyyppi tutkintoTyyppi;

  @Column(name = "julklaisulupa_email", nullable = false)
  private boolean julkaisulupaEmail;

  @Column(name = "julklaisulupa_puhelinnumero", nullable = false)
  private boolean julkaisulupaPuhelinnumero;

  @Column(name = "julklaisulupa_muu_yhteystieto", nullable = false)
  private boolean julkaisulupaMuuYhteystieto;

  @Column(name = "julkaisulupa", nullable = false)
  private boolean julkaisulupa;

  @Column(name = "muu_yhteystieto")
  private String muuYhteystieto;

  @Column(name = "lisatiedot")
  private String lisatiedot;

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "oikeustulkki")
  private Set<Kielipari> kielet = new HashSet<>(0);

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "oikeustulkki")
  private Set<Sijainti> sijainnit = new HashSet<>(0);

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "oikeustulkki")
  private Set<OikeustulkkiMuokkaus> muokkaukset = new HashSet<>(0);

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "oikeustulkki")
  private Set<SahkopostiMuistutus> sahkopostiMuistutukset = new HashSet<>(0);

  public enum TutkintoTyyppi {
    OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO,
    MUU_KORKEAKOULUTUTKINTO,
  }
}
