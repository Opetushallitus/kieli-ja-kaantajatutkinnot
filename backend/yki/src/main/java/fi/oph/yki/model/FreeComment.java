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
@Table(name = "free_comment")
public class FreeComment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "free_comment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "free_registration_id", referencedColumnName = "free_registration_id")
  private FreeRegistration freeRegistration;

  @Column(name = "comment", nullable = false)
  private String comment;
}
