package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Size(max = 255)
  @Column(name = "oid", unique = true)
  private String oid;

  @Size(max = 1024)
  @Column(name = "other_identifier", unique = true)
  private String otherIdentifier;

  @Column(name = "latest_identified_at", nullable = false)
  private LocalDateTime latestIdentifiedAt;

  @OneToMany(mappedBy = "person")
  private List<Enrollment> enrollments = new ArrayList<>();

  @OneToMany(mappedBy = "person")
  private List<Reservation> reservations = new ArrayList<>();

  @Column(name = "uuid", unique = true)
  private UUID uuid;
}
