package fi.oph.vkt.model;

import fi.oph.vkt.model.type.ExamLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_event")
public class ExamEvent extends ExamEventCommon {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "exam_event_id", nullable = false)
  private long id;

  @Column(name = "level", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private ExamLevel level;

  @Column(name = "registration_opens", nullable = false)
  private LocalDateTime registrationOpens;

  @Column(name = "registration_closes", nullable = false)
  private LocalDateTime registrationCloses;

  @Column(name = "max_participants", nullable = false)
  private long maxParticipants;

  @OneToMany(mappedBy = "examEvent")
  @OrderBy("createdAt")
  private List<Enrollment> enrollments = new ArrayList<>();

  @OneToMany(mappedBy = "examEvent")
  private List<Reservation> reservations = new ArrayList<>();
}
