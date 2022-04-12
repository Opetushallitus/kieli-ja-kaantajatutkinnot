package fi.oph.akt.model;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "email")
public class Email extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "email_id", nullable = false)
  private long id;

  @Column(name = "email_type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private EmailType emailType;

  @Column(name = "recipient_name", nullable = false)
  private String recipientName;

  @Column(name = "recipient_address", nullable = false)
  private String recipientAddress;

  @Column(name = "subject", nullable = false)
  private String subject;

  @Column(name = "body", nullable = false)
  private String body;

  @Column(name = "sent_at")
  private LocalDateTime sentAt;

  @Column(name = "error")
  private String error;

  @Column(name = "ext_id")
  private String extId;
}
