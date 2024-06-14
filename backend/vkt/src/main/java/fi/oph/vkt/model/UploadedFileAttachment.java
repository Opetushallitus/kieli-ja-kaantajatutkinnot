package fi.oph.vkt.model;

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
@Table(name = "uploaded_file_attachment")
public class UploadedFileAttachment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "attachment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "free_enrollment_id", referencedColumnName = "free_enrollment_id", nullable = false)
  private FreeEnrollment freeEnrollment;

  @Column(name = "key", unique = true, nullable = false)
  private String key;

  @Column(name = "filename", nullable = false)
  private String filename;

  @Column(name = "size", nullable = false)
  private int size;
}
