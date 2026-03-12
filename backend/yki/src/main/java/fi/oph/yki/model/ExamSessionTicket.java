package fi.oph.yki.model;

import fi.oph.yki.model.type.ExamSessionTicketType;
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
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "exam_session_ticket")
public class ExamSessionTicket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_date_id")
  private ExamDate examDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exam_session_id")
  private ExamSession examSession;

  @Column(name = "type")
  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private ExamSessionTicketType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "registration_id")
  private Registration registration;
}
