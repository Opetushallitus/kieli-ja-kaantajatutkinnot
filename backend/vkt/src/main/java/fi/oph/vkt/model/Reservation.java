package fi.oph.vkt.model;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PostLoad;
import javax.persistence.Table;
import javax.persistence.Transient;
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

  @Column(name = "expires_updated_at")
  private LocalDateTime expiresUpdatedAt;

  @Column(name = "renew_count", nullable = false)
  private int renewCount;

  @PostLoad
  private void storeState() {
    previousExpiresAt = this.getExpiresAt();
  }

  @Override
  protected void prePersist() {
    this.setExpiresUpdatedAt(LocalDateTime.now());
    super.prePersist();
  }

  @Override
  protected void preUpdate() {
    if (this.getExpiresAt().equals(previousExpiresAt)) {
      this.setExpiresUpdatedAt(LocalDateTime.now());
    }
    super.preUpdate();
  }

  public boolean isRenewable() {
    return renewCount < 1;
  }

  public boolean isActive() {
    return LocalDateTime.now().isBefore(expiresAt);
  }
}
