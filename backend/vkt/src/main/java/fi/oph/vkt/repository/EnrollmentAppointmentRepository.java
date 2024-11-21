package fi.oph.vkt.repository;

import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentAppointmentRepository extends BaseRepository<EnrollmentAppointment> {
  Optional<EnrollmentAppointment> findByIdAndAuthHashAndDeletedAtIsNull(final long id, final String paymentLinkHash);
  List<EnrollmentAppointment> findByExaminerAndStatusAndDeletedAtIsNull(
    final Examiner examiner,
    final EnrollmentAppointmentStatus status
  );
}
