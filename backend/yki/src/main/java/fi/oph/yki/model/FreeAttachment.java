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
@Table(name = "free_attachment")
public class FreeAttachment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "free_attachment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "free_registration_id", referencedColumnName = "free_registration_id")
  private FreeRegistration freeEnrollment;

  @Column(name = "key", unique = true, nullable = false)
  private String key;

  @Column(name = "filename", nullable = false)
  private String filename;

  @Column(name = "size", nullable = false)
  private int size;
}
