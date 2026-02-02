package fi.oph.yki.repository;

import fi.oph.yki.model.Registration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
  List<Registration> getByPersonOid(String personOid);

  int countByPersonOid(String personOid);

  @Query(
    "SELECT r FROM Registration r WHERE r.person.oid = ?1" +
    " AND r.state = 'COMPLETED'" +
    " AND r.examSession.examDate.examDate = ?2" +
    " AND r.examSession.language = ?3" +
    " AND r.examSession.level = ?4"
  )
  Optional<Registration> getByOidAndExamDetails(
    final String oid,
    final LocalDate examDate,
    final String language,
    final String level
  );

  @Query(
    "SELECT r FROM Registration r " +
    "JOIN FETCH r.examSession es " +
    "JOIN FETCH es.examDate " +
    "WHERE r.id = :id AND r.person.oid = :oid"
  )
  Optional<Registration> findByIdAndPersonOidWithExamSession(@Param("id") Long id, @Param("oid") String oid);
}
