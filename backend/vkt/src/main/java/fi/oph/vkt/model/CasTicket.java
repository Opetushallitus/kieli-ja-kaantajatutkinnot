package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cas_ticket")
public class CasTicket {

  @Id
  @Column(name = "session_id", nullable = false)
  private String sessionId;

  @Column(name = "ticket", nullable = false, unique = true)
  private String ticket;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;
}
