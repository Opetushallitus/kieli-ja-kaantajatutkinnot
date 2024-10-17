package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "examiner_municipality")
public class ExaminerMunicipality {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "municipality_id", nullable = false)
  private long id;

  @Size(max = 255)
  @Column(name = "name_fi", nullable = false)
  private String nameFi;

  @Size(max = 255)
  @Column(name = "name_sv", nullable = false)
  private String nameSv;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "examiner_id", referencedColumnName = "examiner_id", nullable = false)
  private Examiner examiner;
}
