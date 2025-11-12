package fi.oph.yki.model;

import fi.oph.yki.model.type.RegistrationKind;
import jakarta.persistence.*;


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

  // TODO: Should i actually cascade all?
  @OneToMany(mappedBy = "examSession", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ExamSessionLocation> locations = new ArrayList<>();
}
