package fi.oph.vkt.model;

import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "free_enrollment")
public class FreeEnrollment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "free_enrollment_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
  private Person person;

  @Column(name = "source", nullable = false)
  @Enumerated(value = EnumType.STRING)
  FreeEnrollmentSource source;

  @Column(name = "type", nullable = false)
  @Enumerated(value = EnumType.STRING)
  FreeEnrollmentType type;

  @Column(name = "approved")
  Boolean approved;

  @Column(name = "comment")
  String comment;

  @OneToOne(mappedBy = "freeEnrollment", fetch = FetchType.LAZY, optional = false)
  Enrollment enrollment;

  @OneToMany(fetch = FetchType.LAZY)
  @JoinColumn(name = "free_enrollment_id", referencedColumnName = "free_enrollment_id")
  List<UploadedFileAttachment> attachments;

  @OneToOne(mappedBy = "freeEnrollment", fetch = FetchType.LAZY)
  KoskiEducations koskiEducations;
}
