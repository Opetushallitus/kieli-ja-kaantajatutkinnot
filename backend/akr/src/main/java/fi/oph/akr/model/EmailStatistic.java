package fi.oph.akr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
