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
@Table(name = "contact_request")
public class ContactRequest extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "contact_request_id", nullable = false)
  private long id;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column(name = "message", nullable = false)
  private String message;

  @Size(min = 1, max = 10)
  @Column(name = "from_lang", nullable = false, length = 10)
  private String fromLang;

  @Size(min = 1, max = 10)
  @Column(name = "to_lang", nullable = false, length = 10)
  private String toLang;

  @OneToMany(mappedBy = "contactRequest")
  private Collection<ContactRequestTranslator> contactRequestTranslators = new ArrayList<>();
}
