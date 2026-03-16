package fi.oph.yki.model;

import fi.oph.yki.model.type.ExamSessionType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "exam_date")
public class ExamDate {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "exam_date", nullable = false)
  private LocalDate examDate;

  @Column(name = "registration_start_date", nullable = false)
  private LocalDate registrationStartDate;

  @Column(name = "registration_end_date", nullable = false)
  private LocalDate registrationEndDate;

  @ElementCollection(targetClass = ExamSessionType.class, fetch = FetchType.EAGER)
  @CollectionTable(name = "exam_date_exam_type", joinColumns = @JoinColumn(name = "exam_date_id"))
  @Column(name = "exam_type", nullable = false, columnDefinition = "exam_session_type")
  @JdbcType(PostgreSQLEnumJdbcType.class)
  @Enumerated(EnumType.STRING)
  private List<ExamSessionType> examTypes = new ArrayList<>();

  @OneToMany(mappedBy = "examDate", cascade = CascadeType.PERSIST)
  private List<ExamDateLanguage> languages = new ArrayList<>();
}
