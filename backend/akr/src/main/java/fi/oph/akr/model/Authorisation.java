package fi.oph.akr.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
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

@Getter
@Setter
@Entity
@Table(name = "authorisation")
public class Authorisation extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "authorisation_id", nullable = false)
  private long id;

  @Column(name = "basis", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private AuthorisationBasis basis;

  @Size(min = 1, max = 10)
  @Column(name = "from_lang", nullable = false, length = 10)
  private String fromLang;

  @Size(min = 1, max = 10)
  @Column(name = "to_lang", nullable = false, length = 10)
  private String toLang;

  @Column(name = "term_begin_date")
  private LocalDate termBeginDate;

  @Column(name = "term_end_date")
  private LocalDate termEndDate;

  @Column(name = "permission_to_publish", nullable = false)
  private boolean permissionToPublish;

  @Size(max = 255)
  @Column(name = "diary_number")
  private String diaryNumber;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "translator_id", referencedColumnName = "translator_id", nullable = false)
  private Translator translator;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "meeting_date_id", referencedColumnName = "meeting_date_id")
  private MeetingDate meetingDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "examination_date_id", referencedColumnName = "examination_date_id")
  private ExaminationDate examinationDate;

  @OneToMany(mappedBy = "authorisation")
  private Collection<AuthorisationTermReminder> reminders = new ArrayList<>();

  public boolean isBasisAndExaminationDateConsistent() {
    return (
      (basis == AuthorisationBasis.AUT && examinationDate != null) ||
      (basis != AuthorisationBasis.AUT && examinationDate == null)
    );
  }
}
