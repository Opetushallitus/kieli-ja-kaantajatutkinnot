package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "examiner")
public class Examiner extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "examiner_id", nullable = false)
  private long id;

  @Size(max = 255)
  @Column(name = "oid", unique = true, nullable = false)
  private String oid;

  @Size(max = 255)
  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "nickname", nullable = false)
  private String nickname;

  @Column(name = "exam_language_finnish", nullable = false)
  private boolean examLanguageFinnish;

  @Column(name = "exam_language_swedish", nullable = false)
  private boolean examLanguageSwedish;

  // TODO Consider using a separate join table instead?
  @OneToMany(mappedBy = "examiner")
  private List<ExaminerMunicipality> municipalities = new ArrayList<>();
  // TODO
  // Tarvitaan julkiseen käyttöön
  // - nimi (haetaan ONR:stä / jostain virkailijapalvelusta?)
  // - tutkintokielet
  // - paikkakunnat
  // - tutkintopäivät

  // Yhteydenottoja varten:
  // - sähköposti

  // Muuta virkailijakäyttöä varten
  // - puhelinnumero?
  // - OID

  // Tutkintojen vastaanottajat voi muokata omia tietojaan
  // -> Miten linkitetään kirjautunut käyttäjä tutkinnon vastaanottajaan?
  // -> Auktorisointi (ja autentikointi)

  // Käyttöoikeudet käyttöoikeuspalvelun kautta
  // -> Lisätään tauluun käyttäjätunnus / id, joka "omistaa" TV-rivin
  // -> OID, löytyy kirjautuneelle virkailijalle vastauksena esim. GET /kayttooikeus-service/cas/me

}
