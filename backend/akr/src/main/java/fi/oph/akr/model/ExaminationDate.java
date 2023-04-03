package fi.oph.akr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "examination_date")
public class ExaminationDate extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "examination_date_id", nullable = false)
  private long id;

  @Column(name = "date", nullable = false, unique = true)
  private LocalDate date;

  @OneToMany(mappedBy = "examinationDate")
  private Collection<Authorisation> authorisations = new ArrayList<>();
}
