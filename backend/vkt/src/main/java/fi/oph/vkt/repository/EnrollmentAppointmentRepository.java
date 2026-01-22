package fi.oph.vkt.repository;

import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.Person;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentAppointmentRepository extends BaseRepository<EnrollmentAppointment> {
  Optional<EnrollmentAppointment> findByIdAndAuthHashAndDeletedAtIsNull(final long id, final String authHash);
  Optional<EnrollmentAppointment> findByIdAndPaymentLinkHashAndDeletedAtIsNull(
    final long id,
    final String paymentLinkHash
  );

  @Query(
    "SELECT e" +
    " FROM EnrollmentAppointment e" +
    " WHERE e.examiner = ?1" +
    " AND e.status = fi.oph.vkt.model.type.EnrollmentAppointmentStatus.CONTACT_CREATED" +
    " AND e.deletedAt IS NULL" +
    " ORDER BY e.createdAt DESC"
  )
  List<EnrollmentAppointment> findExaminerContactRequests(final Examiner examiner);

  @Query(
    "SELECT e" +
    " FROM EnrollmentAppointment e" +
    " WHERE e.person = ?1" +
    " AND e.status IN (fi.oph.vkt.model.type.EnrollmentAppointmentStatus.COMPLETED)" +
    " AND e.deletedAt IS NULL" +
    " ORDER BY e.createdAt DESC"
  )
  List<EnrollmentAppointment> findPersonEnrollmentHistory(final Person person);

  @Query(
    "SELECT e" +
    " FROM EnrollmentAppointment e" +
    " WHERE e.status = fi.oph.vkt.model.type.EnrollmentAppointmentStatus.COMPLETED" +
    " AND (e.lastSyncAt IS NULL OR e.lastSyncAt < e.modifiedAt)"
  )
  List<EnrollmentAppointment> findEnrollmentsForSyncToRegister();
}
