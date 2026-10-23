package fi.oph.yki.repository;

import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeRegistrationRepository extends JpaRepository<FreeRegistration, Long> {
  @Query("SELECT fr" + " FROM FreeRegistration fr" + " WHERE fr.source = 'USER'")
  List<FreeRegistration> findApprovals();

  @Query(
    "SELECT count(f)" +
    " FROM FreeRegistration f" +
    " JOIN f.registration r" +
    " WHERE r.person.oid = ?1" +
    " AND (r.state = 'COMPLETED' OR" +
    "       (r.state = 'SUBMITTED' AND r.kind = 'QUEUE'))"
  )
  int countFreeRegistrationsUsed(final String personOid);

  Optional<FreeRegistration> findByRegistration(Registration registration);

  @Query(
    "SELECT count(DISTINCT r.examSession.id)" +
    " FROM FreeRegistration f" +
    " JOIN f.registration r" +
    " WHERE r.person.oid = :personOid" +
    " AND f.source = :source" +
    " AND r.examSession.id <> :excludedExamSessionId" +
    " AND (r.state IN ('STARTED', 'COMPLETED') OR" +
    "       (r.state = 'SUBMITTED' AND r.kind = 'QUEUE'))"
  )
  long countExamSessionsWithFreeRegistration(
    @Param("personOid") String personOid,
    @Param("source") FreeRegistrationSource source,
    @Param("excludedExamSessionId") long excludedExamSessionId
  );
}
