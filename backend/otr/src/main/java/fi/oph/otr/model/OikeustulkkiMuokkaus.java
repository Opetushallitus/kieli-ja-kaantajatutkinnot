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
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * User: tommiratamaa
 * Date: 7.6.2016
 * Time: 12.09
 */
@Entity
@Getter
@Setter
@Table(name = "oikeustulkki_muokkaus", schema = "public")
public class OikeustulkkiMuokkaus implements Serializable {

  @Id
  @Column(name = "id", nullable = false, updatable = false, unique = true)
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  //  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "oikeustulkki_muokkaus_id_seq")
  //  @SequenceGenerator(
  //    name = "oikeustulkki_muokkaus_id_seq",
  //    sequenceName = "oikeustulkki_muokkaus_id_seq",
  //    allocationSize = 1
  //  )
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "oikeustulkki", nullable = false)
  private Oikeustulkki oikeustulkki;

  @Column(name = "muokattu", nullable = false)
  private LocalDateTime muokattu = LocalDateTime.now();

  @Column(name = "muokkaaja", nullable = false) // oid
  private String muokkaaja;

  @Column(name = "muokkausviesti")
  private String muokkausviesti;
}
