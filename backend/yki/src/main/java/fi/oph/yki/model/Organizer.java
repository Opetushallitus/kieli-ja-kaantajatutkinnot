package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "organizer")
public class Organizer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "oid", nullable = false)
  private String oid;

  @Column(name = "agreement_start_date", nullable = false)
  private LocalDate agreementStartDate;

  @Column(name = "agreement_end_date", nullable = false)
  private LocalDate agreementEndDate;

  @Column(name = "contact_name")
  private String contactName;

  @Column(name = "contact_email")
  private String contactEmail;

  @Column(name = "contact_phone_number")
  private String contactPhoneNumber;

  @Column(name = "extra")
  private String extra;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @OneToMany(mappedBy = "organizer")
  private List<ExamLanguage> languages = new ArrayList<>();
}
