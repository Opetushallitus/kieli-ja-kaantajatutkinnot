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

  @OneToMany(mappedBy = "translator")
  private Collection<Authorisation> authorisations = new ArrayList<>();

  @OneToMany(mappedBy = "translator")
  private Collection<ContactRequestTranslator> contactRequestTranslators = new ArrayList<>();

  @Size(max = 255)
  @Column(name = "identity_number", unique = true)
  private String identityNumber;

  @Size(max = 255)
  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Size(max = 255)
  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Size(max = 255)
  @Column(name = "email", unique = true)
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

  @Column(name = "extra_information")
  private String extraInformation;

  @Column(name = "is_assurance_given", nullable = false)
  private boolean isAssuranceGiven;

  public String getFullName() {
    return firstName + " " + lastName;
  }

  public boolean hasEmail() {
    return email != null;
  }
}
