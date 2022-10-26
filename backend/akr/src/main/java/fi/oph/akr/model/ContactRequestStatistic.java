package fi.oph.akr.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contact_request_statistic")
public class ContactRequestStatistic extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "contact_request_statistic_id", nullable = false)
  private long id;

  @Column(name = "year", nullable = false)
  private int year;

  @Column(name = "month", nullable = false)
  private int month;

  @Column(name = "day", nullable = false)
  private int day;

  @Size(min = 1, max = 10)
  @Column(name = "from_lang", nullable = false, length = 10)
  private String fromLang;

  @Size(min = 1, max = 10)
  @Column(name = "to_lang", nullable = false, length = 10)
  private String toLang;

  @Column(name = "contact_request_count", nullable = false)
  private long contactRequestCount;

  @Column(name = "translator_count", nullable = false)
  private long translatorCount;
}
