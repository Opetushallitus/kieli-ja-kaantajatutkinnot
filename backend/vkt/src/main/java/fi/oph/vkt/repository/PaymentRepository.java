package fi.oph.vkt.repository;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.type.PaymentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends BaseRepository<Payment> {
  // Use this when you want to lock payment processing so that
  // there is no race condition with paytrail callback
  @Query(value = "SELECT * FROM payment p WHERE p.payment_id = :paymentId FOR UPDATE", nativeQuery = true)
  Optional<Payment> findWithLockingById(@Param("paymentId") final Long paymentId);

  @Query(
    value = "SELECT p" +
    " FROM Payment p" +
    " WHERE p.createdAt BETWEEN :from AND :to" +
    " AND p.paymentStatus = fi.oph.vkt.model.type.PaymentStatus.OK"
  )
  List<Payment> findPaymentsReport(final LocalDateTime from, final LocalDateTime to);
}
