package fi.oph.vkt.repository;

import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.type.EnrollmentStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeEnrollmentRepository extends BaseRepository<FreeEnrollment> {
  @Query(
    "SELECT count(f)" +
    " FROM FreeEnrollment f" +
    " JOIN f.enrollment e" +
    " WHERE f.person.id = ?1" +
    " AND f.approved <> false" +
    " AND (e.status = fi.oph.vkt.model.type.EnrollmentStatus.COMPLETED" +
    " OR e.status = fi.oph.vkt.model.type.EnrollmentStatus.AWAITING_APPROVAL)" +
    " AND e.textualSkill = true"
  )
  int findUsedTextualSkillFreeEnrollmentsForPerson(final long personId);

  @Query(
    "SELECT count(f)" +
    " FROM FreeEnrollment f" +
    " JOIN f.enrollment e" +
    " WHERE f.person.id = ?1" +
    " AND f.approved <> false" +
    " AND (e.status = fi.oph.vkt.model.type.EnrollmentStatus.COMPLETED" +
    "   OR e.status = fi.oph.vkt.model.type.EnrollmentStatus.AWAITING_APPROVAL)" +
    " AND e.oralSkill = true"
  )
  int findUsedOralSkillFreeEnrollmentsForPerson(final long personId);
}
