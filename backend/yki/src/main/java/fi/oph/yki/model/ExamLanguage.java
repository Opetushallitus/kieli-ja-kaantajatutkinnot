package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_language")
public class ExamLanguage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @Column(name = "language_code", nullable = false)
  private String languageCode;

  @Column(name = "level_code", nullable = false)
  private String levelCode;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organizer_id", referencedColumnName = "id")
  private Organizer organizer;
}
