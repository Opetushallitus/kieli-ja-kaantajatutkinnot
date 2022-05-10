package fi.oph.otr.model;

import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "language_pair")
public class LanguagePair extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "language_pair_id", nullable = false)
  private long id;

  @Column(name = "from_lang", nullable = false, length = 10)
  @Size(min = 1, max = 10)
  private String fromLang;

  @Column(name = "to_lang", nullable = false, length = 10)
  @Size(min = 1, max = 10)
  private String toLang;

  @Column(name = "begin_date", nullable = false)
  private LocalDate beginDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "qualification_id", nullable = false)
  private Qualification qualification;
}
