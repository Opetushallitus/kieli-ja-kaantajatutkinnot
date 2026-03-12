package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
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
  List<Registration> getByExamSessionAndStateIn(ExamSession examSession, List<RegistrationState> states);

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

  Optional<Registration> findByPersonOidAndExamSessionIdAndState(
    String personOid,
    Long examSessionId,
    RegistrationState state
  );

  @Query(
    """
      SELECT COUNT(r) < es.maxParticipants
      FROM Registration r JOIN r.examSession es
      WHERE es.id = :examSessionId
        AND r.state IN ('COMPLETED', 'SUBMITTED', 'STARTED')
        AND r.kind = 'ADMISSION'
      """
  )
  boolean isSpaceLeft(@Param("examSessionId") Long examSessionId);

  @Query(
    """
      SELECT COUNT(r) > 0
      FROM Registration r
      JOIN r.examSession es
      JOIN es.examDate ed
      WHERE r.person.oid = :personOid
        AND r.state IN ('COMPLETED', 'SUBMITTED', 'STARTED')
        AND ed.id = (SELECT es2.examDate.id FROM ExamSession es2 WHERE es2.id = :examSessionId)
      """
  )
  boolean isPersonAlreadyRegisteredOnExamDate(
    @Param("personOid") String personOid,
    @Param("examSessionId") Long examSessionId
  );
}
