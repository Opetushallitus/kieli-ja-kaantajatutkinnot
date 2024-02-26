package fi.oph.akr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.Collection;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "translator")
public class Translator extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "translator_id", nullable = false)
  private long id;

  @Column(name = "onr_id", nullable = false, unique = true)
  @Size(max = 255)
  private String onrId;

  @OneToMany(mappedBy = "translator")
  private Collection<Authorisation> authorisations = new ArrayList<>();

  @OneToMany(mappedBy = "translator")
  private Collection<ContactRequestTranslator> contactRequestTranslators = new ArrayList<>();

  // TODO: after old AKR data deletion is done remove the below code
  @Size(max = 255)
  @Column(name = "identity_number")
  private String identityNumber;

  @Size(max = 255)
  @Column(name = "first_name")
  private String firstName;

  @Size(max = 255)
  @Column(name = "last_name")
  private String lastName;

  @Size(max = 255)
  @Column(name = "email")
  private String email;

  @Column(name = "phone_number")
  private String phone;

  @Column(name = "street")
  private String street;

  @Column(name = "town")
  private String town;

  @Column(name = "postal_code")
  private String postalCode;

  @Column(name = "country")
  private String country;

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  @Column(name = "extra_information")
  private String extraInformation;

  @Column(name = "selected_source")
  private String selectedSource;

  @Column(name = "selected_type")
  private String selectedType;

  @Column(name = "is_assurance_given", nullable = false)
  private boolean isAssuranceGiven;
}
