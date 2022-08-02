package fi.oph.vkt.model;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "participant")
public class Participant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "participant_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exam_event_id", referencedColumnName = "exam_event_id", nullable = false)
  private ExamEvent examEvent;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;

  @OneToMany(mappedBy = "participant")
  private List<Payment> payments = new ArrayList<>();

  @OneToMany(mappedBy = "participant")
  private List<Link> links = new ArrayList<>();

  @Column(name = "writing", nullable = false)
  private boolean writing;

  @Column(name = "speaking", nullable = false)
  private boolean speaking;

  @Column(name = "reading_comprehension", nullable = false)
  private boolean readingComprehension;

  @Column(name = "speech_comprehension", nullable = false)
  private boolean speechComprehension;
}
