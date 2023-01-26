package fi.oph.vkt.repository;

import fi.oph.vkt.model.Enrollment;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends BaseRepository<Enrollment> {
  @Query(
    value = "SELECT * FROM enrollment e" +
    " JOIN person p USING (person_id)" +
    " WHERE e.exam_event_id = :examEventId AND p.identity_number = :identityNumber" +
    " LIMIT 1",
    nativeQuery = true
  )
  Optional<Enrollment> findByExamEventAndIdentityNumber(Long examEventId, String identityNumber);
}
