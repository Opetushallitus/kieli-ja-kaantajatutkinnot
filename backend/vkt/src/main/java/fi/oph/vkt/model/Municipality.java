package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "municipality")
public class Municipality extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "municipality_id", nullable = false)
  private long id;

  // Code should match the koodiArvo of an entry in koodisto
  @Column(name = "code", nullable = false, unique = true)
  private String code;

  @Column(name = "name_fi", nullable = false)
  private String nameFI;

  @Column(name = "name_sv", nullable = false)
  private String nameSV;

  @ManyToMany(fetch = FetchType.LAZY, mappedBy = "municipalities")
  private List<Examiner> examiners;
}
