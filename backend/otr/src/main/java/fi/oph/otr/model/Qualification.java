package fi.oph.otr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "qualification")
public class Qualification extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "qualification_id", nullable = false)
  private long id;

  @Column(name = "from_lang", nullable = false, length = 10)
  @Size(min = 1, max = 10)
  private String fromLang;

  @Column(name = "to_lang", nullable = false, length = 10)
  @Size(min = 1, max = 10)
  private String toLang;

  @Column(name = "examination_type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private ExaminationType examinationType;

  @Column(name = "begin_date", nullable = false)
  private LocalDate beginDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "permission_to_publish", nullable = false)
  private boolean permissionToPublish;

  @Size(max = 255)
  @Column(name = "diary_number")
  private String diaryNumber;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "interpreter_id", referencedColumnName = "interpreter_id", nullable = false)
  private Interpreter interpreter;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "meeting_date_id", referencedColumnName = "meeting_date_id", nullable = false)
  private MeetingDate meetingDate;

  @OneToMany(mappedBy = "qualification")
  private List<QualificationReminder> reminders = new ArrayList<>();
}
