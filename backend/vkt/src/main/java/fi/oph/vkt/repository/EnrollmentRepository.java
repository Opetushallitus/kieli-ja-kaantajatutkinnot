package fi.oph.vkt.repository;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends BaseRepository<Enrollment> {
  List<Enrollment> findAllByStatus(final EnrollmentStatus enrollmentStatus);
  Optional<Enrollment> findByExamEventAndPerson(final ExamEvent examEvent, final Person person);
  Optional<Enrollment> findByExamEventAndPaymentLinkHash(final ExamEvent examEvent, final String paymentLinkHash);
}
