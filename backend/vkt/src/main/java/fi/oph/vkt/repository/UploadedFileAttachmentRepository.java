package fi.oph.vkt.repository;

import fi.oph.vkt.model.UploadedFileAttachment;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedFileAttachmentRepository extends BaseRepository<UploadedFileAttachment> {
  Optional<UploadedFileAttachment> findByKey(final String id);
}
