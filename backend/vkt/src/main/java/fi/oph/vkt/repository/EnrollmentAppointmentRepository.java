package fi.oph.vkt.repository;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentAppointmentRepository extends BaseRepository<EnrollmentAppointment> {
  Optional<EnrollmentAppointment> findByIdAndAuthHash(final long id, final String paymentLinkHash);
}
