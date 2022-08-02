package fi.oph.otr.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.Size;
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

  @Column(name = "begin_date", nullable = false)
  private LocalDate beginDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "examination_type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private QualificationExaminationType examinationType;

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
