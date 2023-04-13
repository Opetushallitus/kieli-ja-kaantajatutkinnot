package fi.oph.vkt.model;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "person")
public class Person extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "person_id", nullable = false)
  private long id;

  @Size(max = 255)
  @Column(name = "oid", unique = true)
  private String oid;

  @Size(max = 255)
  @Column(name = "identity_number", unique = true)
  private String identityNumber;

  @Size(max = 2048)
  @Column(name = "other_identifier")
  private String otherIdentifier;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @OneToMany(mappedBy = "person")
  private List<Enrollment> enrollments = new ArrayList<>();

  @OneToMany(mappedBy = "person")
  private List<Reservation> reservations = new ArrayList<>();
}
