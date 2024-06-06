package fi.oph.vkt.repository;

import fi.oph.vkt.model.FreeEnrollment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeEnrollmentRepository extends BaseRepository<FreeEnrollment> {
  @Query(
    "SELECT count(f)" +
    " FROM FreeEnrollment f" +
    " JOIN f.enrollment e" +
    " WHERE f.person.id = ?1" +
    " AND e.textualSkill = true"
  )
  int findUsedTextualSkillFreeEnrollmentsForPerson(final long personId);

  @Query(
    "SELECT count(f)" +
    " FROM FreeEnrollment f" +
    " JOIN f.enrollment e" +
    " WHERE f.person.id = ?1" +
    " AND e.oralSkill = true"
  )
  int findUsedOralSkillFreeEnrollmentsForPerson(final long personId);
}
