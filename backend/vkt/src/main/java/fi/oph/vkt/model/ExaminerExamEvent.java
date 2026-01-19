package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
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

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "municipality_id", referencedColumnName = "municipality_id", nullable = false)
  private Municipality municipality;

  @Column(name = "registration_closes")
  private LocalDate registrationCloses;

  @Column(name = "max_participants")
  private Long maxParticipants;

  @Column(name = "location")
  private String location;

  @Column(name = "other_information")
  private String otherInformation;

  @Column(name = "exam_time")
  private String examTime;

  @OneToMany(mappedBy = "examinerExamEvent")
  private List<EnrollmentAppointment> enrollments = new ArrayList<>();
}
