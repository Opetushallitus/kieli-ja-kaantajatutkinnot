package fi.oph.otr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
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

  @Column(name = "ext_id")
  private String extId;

  @Column(name = "error")
  private String error;
}
