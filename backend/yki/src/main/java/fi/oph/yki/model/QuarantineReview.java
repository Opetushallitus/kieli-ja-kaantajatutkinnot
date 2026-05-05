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
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "quarantine_review")
public class QuarantineReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "quarantine_id", referencedColumnName = "id", nullable = false)
  private Quarantine quarantine;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "registration_id", referencedColumnName = "id", nullable = false)
  private Registration registration;

  @Column(name = "quarantined", nullable = false)
  private boolean quarantined;

  @Column(name = "created")
  private LocalDateTime created;

  @Column(name = "updated")
  private LocalDateTime updated;

  @Column(name = "reviewer_oid", nullable = false)
  private String reviewerOid;
}
