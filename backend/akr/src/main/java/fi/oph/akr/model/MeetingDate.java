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
@Table(name = "meeting_date")
public class MeetingDate extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "meeting_date_id", nullable = false)
  private long id;

  @Column(name = "date", nullable = false, unique = true)
  private LocalDate date;

  @OneToMany(mappedBy = "meetingDate")
  private Collection<Authorisation> authorisations = new ArrayList<>();
}
