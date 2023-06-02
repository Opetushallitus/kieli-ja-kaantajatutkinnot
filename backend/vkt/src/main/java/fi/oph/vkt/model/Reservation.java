package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reservation")
public class Reservation extends BaseEntity {

  @Transient
  private LocalDateTime previousExpiresAt;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "reservation_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exam_event_id", referencedColumnName = "exam_event_id", nullable = false)
  private ExamEvent examEvent;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "renewed_at")
  private LocalDateTime renewedAt;

  @PostLoad
  private void storeState() {
    previousExpiresAt = this.getExpiresAt();
  }

  @Override
  protected void preUpdate() {
    if (!this.getExpiresAt().equals(previousExpiresAt)) {
      this.setRenewedAt(LocalDateTime.now());
    }
    super.preUpdate();
  }

  public boolean isRenewable() {
    return this.getRenewedAt() == null;
  }

  public boolean isActive() {
    return LocalDateTime.now().isBefore(expiresAt);
  }
}
