package fi.oph.yki.model;

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
public class Person {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "person_id", nullable = false)
  private long id;

  @Size(max = 255)
  @Column(name = "oid", unique = true)
  private String oid;
}
