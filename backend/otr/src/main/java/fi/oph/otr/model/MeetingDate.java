package fi.oph.otr.model;

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
@Table(name = "meeting_date")
public class MeetingDate extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "meeting_date_id", nullable = false)
  private long id;

  @Column(name = "date", nullable = false, unique = true)
  private LocalDate date;

  @OneToMany(mappedBy = "meetingDate")
  private Collection<Qualification> qualifications = new ArrayList<>();
}
