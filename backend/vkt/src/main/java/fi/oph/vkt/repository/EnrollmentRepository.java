package fi.oph.vkt.repository;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends BaseRepository<Enrollment> {
  List<Enrollment> findAllByStatus(final EnrollmentStatus enrollmentStatus);
  Optional<Enrollment> findByExamEventAndPerson(final ExamEvent examEvent, final Person person);
  Optional<Enrollment> findByExamEventAndPaymentLinkHash(final ExamEvent examEvent, final String paymentLinkHash);

  // When enrollment has free_enrollment and approved is null it is undecided and consumes free enrollment
  @Query(
    "SELECT new fi.oph.vkt.api.dto.FreeEnrollmentDetails(count(e.textualSkill) filter (where e.textualSkill), count(e.oralSkill) filter (where e.oralSkill))" +
    " FROM Enrollment e" +
    " LEFT JOIN e.freeEnrollment fe" +
    " WHERE e.person = ?1" +
    " AND e.status IN (fi.oph.vkt.model.type.EnrollmentStatus.COMPLETED, fi.oph.vkt.model.type.EnrollmentStatus.AWAITING_APPROVAL)" +
    " AND e.freeEnrollment IS NOT NULL" +
    " AND (fe.approved IS NULL OR fe.approved = true)"
  )
  FreeEnrollmentDetails countEnrollmentsByPerson(final Person person);
}
