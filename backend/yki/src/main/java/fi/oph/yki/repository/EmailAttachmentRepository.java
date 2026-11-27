package fi.oph.yki.repository;

import fi.oph.yki.model.EmailAttachment;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailAttachmentRepository extends BaseRepository<EmailAttachment> {
  @Query(
    "SELECT a.id AS id, a.email.id AS emailId, a.name AS name" +
    " FROM EmailAttachment a WHERE a.email.id IN :emailIds ORDER BY a.id"
  )
  List<EmailAttachmentListProjection> findAllByEmailIdIn(@Param("emailIds") Collection<Long> emailIds);

  Optional<EmailAttachment> findByIdAndEmailId(long id, long emailId);
}
