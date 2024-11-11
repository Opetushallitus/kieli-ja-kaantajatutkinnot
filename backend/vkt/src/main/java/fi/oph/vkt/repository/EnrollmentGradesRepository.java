package fi.oph.vkt.repository;

import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentGradesRepository extends BaseRepository<EnrollmentGrade> {
  Optional<EnrollmentGrade> findByEnrollmentAppointment(final EnrollmentAppointment enrollmentAppointment);
}
