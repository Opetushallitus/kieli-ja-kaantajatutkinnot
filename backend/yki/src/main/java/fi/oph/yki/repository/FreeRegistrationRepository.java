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
    " AND r.state = 'COMPLETED'"
  )
  int countFreeRegistrationsUsed(final String personOid);

  // TODO FreeRegistration plays currently little role in query - does this work?
  @Query(
    "SELECT count(distinct r.id)" +
    " FROM FreeRegistration f" +
    " INNER JOIN Registration r ON f.registration.id = r.id" +
    " INNER JOIN ExamSession es ON r.examSession.id = es.id" +
    " WHERE r.person.oid = ?1" +
    " AND r.state = 'COMPLETED'" +
    " AND es.language = ?2"
  )
  int countUsedFreeRegistrationsForLanguage(final String personOid, final String language);
}
