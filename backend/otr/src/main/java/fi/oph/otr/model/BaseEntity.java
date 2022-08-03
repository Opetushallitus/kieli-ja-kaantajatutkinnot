package fi.oph.otr.model;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.OptimisticLockException;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.context.SecurityContextHolder;

@Getter
@Setter
@MappedSuperclass
public class BaseEntity {

  @Version
  @Column(name = "version", nullable = false)
  private int version;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "modified_by")
  private String modifiedBy;

  @Column(name = "deleted_by")
  private String deletedBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  // This is nullable for entities db level, same goes for entities in AKR
  @Column(name = "modified_at", nullable = false)
  private LocalDateTime modifiedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  private String getCurrentUserId() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
  }

  @PrePersist
  protected void prePersist() {
    final LocalDateTime now = LocalDateTime.now();
    setCreatedAt(now);
    setModifiedAt(now);

    final String currentUser = getCurrentUserId();
    if (getCreatedBy() == null) {
      setCreatedBy(currentUser);
      setModifiedBy(currentUser);
    }
  }

  @PreUpdate
  void preUpdate() {
    final LocalDateTime now = LocalDateTime.now();
    setModifiedAt(now);

    final String currentUser = getCurrentUserId();
    setModifiedBy(currentUser);
  }

  public void assertVersion(final int version) {
    if (version != getVersion()) {
      throw new OptimisticLockException(
        "Current version: " + getVersion() + " does not match given version: " + version
      );
    }
  }

  public boolean isDeleted() {
    return getDeletedAt() != null;
  }

  public void markDeleted() {
    this.deletedAt = LocalDateTime.now();
    this.deletedBy = getCurrentUserId();
  }
}
