package fi.oph.akr.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
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
