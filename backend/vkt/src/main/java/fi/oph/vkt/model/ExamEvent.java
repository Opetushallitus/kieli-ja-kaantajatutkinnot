package fi.oph.vkt.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "exam_event")
public class ExamEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "exam_event_id", nullable = false)
  private long id;

  @Column(name = "date", nullable = false)
  private LocalDate date;

  @Column(name = "registration_opens", nullable = false)
  private LocalDate registrationOpens;

  @Column(name = "registration_closes", nullable = false)
  private LocalDate registrationCloses;

  @Column(name = "max_participants", nullable = false)
  private int maxParticipants;

  @OneToMany(mappedBy = "examEvent")
  private List<Participant> participants = new ArrayList<>();
}
