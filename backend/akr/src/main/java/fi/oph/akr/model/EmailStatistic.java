package fi.oph.akr.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "email_statistic")
public class EmailStatistic extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "email_statistic_id", nullable = false)
  private long id;

  @Column(name = "year", nullable = false)
  private int year;

  @Column(name = "month", nullable = false)
  private int month;

  @Column(name = "day", nullable = false)
  private int day;

  @Column(name = "email_type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private EmailType emailType;

  @Column(name = "count", nullable = false)
  private long count;
}
