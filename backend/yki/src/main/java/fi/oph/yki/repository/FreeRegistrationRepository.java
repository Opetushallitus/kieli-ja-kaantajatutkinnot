package fi.oph.yki.repository;

import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeRegistrationRepository extends JpaRepository<FreeRegistration, Long> {
  @Query("SELECT fr" + " FROM FreeRegistration fr" + " WHERE fr.source = 'USER'")
  List<FreeRegistration> findApprovals();

  // Partial exam registrations to the same exam session use one free registration together,
  // so exam sessions are counted, not registrations.
  @Query(
    "SELECT count(DISTINCT r.examSession.id)" +
    " FROM FreeRegistration f" +
    " JOIN f.registration r" +
    " WHERE r.person.oid = :personOid" +
    " AND f.source IN :sources" +
    " AND r.examSession.id <> :excludedExamSessionId" +
    " AND (r.state IN ('STARTED', 'COMPLETED') OR" +
    "       (r.state = 'SUBMITTED' AND r.kind = 'QUEUE'))"
  )
  long countExamSessionsWithEducationFreeRegistration(
    @Param("personOid") String personOid,
    @Param("sources") Collection<FreeRegistrationSource> sources,
    @Param("excludedExamSessionId") long excludedExamSessionId
  );
}
