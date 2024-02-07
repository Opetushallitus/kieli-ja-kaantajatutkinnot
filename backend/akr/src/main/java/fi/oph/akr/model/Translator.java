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

  @Column(name = "extra_information")
  private String extraInformation;

  @Column(name = "selected_address")
  private String selectedAddress;

  @Column(name = "is_assurance_given", nullable = false)
  private boolean isAssuranceGiven;
}
