package fi.oph.yki.repository;

import fi.oph.yki.model.FreeRegistration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
