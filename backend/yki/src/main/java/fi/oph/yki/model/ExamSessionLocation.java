package fi.oph.yki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_session_location")
public class ExamSessionLocation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id", nullable = false)
  private ExamSession examSession;

  @Column(name = "name")
  private String name;

  @Column(name = "post_office")
  private String postOffice;

  @Column(name = "lang")
  private String lang;
}
