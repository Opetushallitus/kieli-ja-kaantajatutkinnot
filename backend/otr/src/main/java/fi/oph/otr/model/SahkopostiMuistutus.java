package fi.oph.otr.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * User: tommiratamaa
 * Date: 21.6.2016
 * Time: 14.07
 */
@Entity
@Getter
@Setter
@Table(name = "sahkoposti_muistutus", schema = "public")
public class SahkopostiMuistutus implements Serializable {

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sahkoposti_muistutus_id_seq")
  //  @SequenceGenerator(
  //    name = "sahkoposti_muistutus_id_seq",
  //    sequenceName = "sahkoposti_muistutus_id_seq",
  //    allocationSize = 1
  //  )
  private Long id;

  @Column(name = "luotu")
  private LocalDateTime luotu = LocalDateTime.now();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "oikeustulkki", nullable = false)
  private Oikeustulkki oikeustulkki;

  @Column(name = "lahetetty")
  private LocalDateTime lahetetty;

  @Column(name = "lahettaja", nullable = false)
  private String lahettaja;

  @Column(name = "vastaanottaja", nullable = false)
  private String vastaanottaja;

  @Column(name = "template_name", nullable = false)
  private String templateName;

  @Column(name = "sahkoposti_id")
  private Long sahkopostiId;

  //@AttributeOverrides(
  //  @AttributeOverride(name = "koodi", column = @Column(name = "kieli", nullable = false, updatable = false))
  //)
  //private Kieli kieli;

  @Column(name = "virhe")
  private String virhe;
}
