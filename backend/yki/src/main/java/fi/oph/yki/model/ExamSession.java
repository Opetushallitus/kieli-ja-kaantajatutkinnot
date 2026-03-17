package fi.oph.yki.model;

import fi.oph.yki.model.type.ExamSessionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

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

  @Column(name = "contact_name")
  private String contactName;

  @Column(name = "contact_email")
  private String contactEmail;

  @Column(name = "contact_phone_number")
  private String contactPhoneNumber;

  @Column(name = "type", columnDefinition = "exam_session_type")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private ExamSessionType type;

  @OneToMany(mappedBy = "examSession")
  private List<ExamSessionLocation> locations = new ArrayList<>();

  @OneToMany(mappedBy = "examSession")
  private List<Registration> registrations = new ArrayList<>();
}
