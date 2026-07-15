package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "quarantine")
public class Quarantine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "language_code", nullable = false)
  private String languageCode;

  @Column(name = "ssn")
  private String ssn;

  @Column(name = "birthdate", nullable = false)
  private String birthdate;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "email")
  private String email;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column(name = "diary_number", nullable = false)
  private String diaryNumber;

  @Column(name = "created", insertable = false, updatable = false)
  private LocalDateTime created;

  @Column(name = "updated")
  private LocalDateTime updated;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;
}
