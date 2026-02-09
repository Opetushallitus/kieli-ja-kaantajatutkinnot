package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_session")
public class ExamSession {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_date_id", referencedColumnName = "id")
  private ExamDate examDate;

  @Column(name = "language_code")
  private String language;

  @Column(name = "level_code")
  private String level;

  @Column(name = "max_participants")
  private Integer maxParticipants;

  @Column(name = "office_oid")
  private String officeOid;

  @JoinTable(name = "exam_session_contact")
  @OneToMany(fetch = FetchType.LAZY)
  private List<ExamSessionContact> contact;

  @OneToMany(mappedBy = "examSession")
  private List<ExamSessionLocation> locations = new ArrayList<>();

  @OneToMany(mappedBy = "examSession")
  private List<Registration> registrations = new ArrayList<>();
}
