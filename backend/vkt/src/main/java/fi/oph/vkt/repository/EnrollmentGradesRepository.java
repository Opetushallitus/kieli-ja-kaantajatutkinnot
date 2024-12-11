package fi.oph.vkt.repository;

import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentGradesRepository extends BaseRepository<EnrollmentGrade> {
  Optional<EnrollmentGrade> findByEnrollmentAppointment(final EnrollmentAppointment enrollmentAppointment);
}
