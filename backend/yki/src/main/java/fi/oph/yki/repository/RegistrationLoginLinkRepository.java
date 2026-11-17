package fi.oph.yki.repository;

import fi.oph.yki.model.RegistrationLoginLink;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationLoginLinkRepository extends BaseRepository<RegistrationLoginLink> {
  @EntityGraph(attributePaths = { "identity", "registration.examSession" })
  Optional<RegistrationLoginLink> findByCode(final String code);

  boolean existsByRegistrationIdAndEmailAndCreatedAtAfter(
    final long registrationId,
    final String email,
    final LocalDateTime createdAfter
  );
}
