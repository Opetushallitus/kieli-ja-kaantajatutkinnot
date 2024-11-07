package fi.oph.vkt.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "examiner_exam_event")
public class ExaminerExamEvent extends ExamEventCommon {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "examiner_exam_event_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "examiner_id", referencedColumnName = "examiner_id")
  private Examiner examiner;

  @Column(name = "registration_closes")
  private LocalDateTime registrationCloses;

  @Column(name = "max_participants")
  private Long maxParticipants;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "municipality_id", referencedColumnName = "municipality_id", nullable = false)
  private Municipality municipality;

  @Column(name = "location", nullable = false)
  private String location;
  //@OneToMany(mappedBy = "examinerExamEvent")
  //private List<EnrollmentAppointment> enrollments = new ArrayList<>();

}
