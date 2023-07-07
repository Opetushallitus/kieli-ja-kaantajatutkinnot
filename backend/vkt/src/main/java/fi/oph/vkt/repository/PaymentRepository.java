package fi.oph.vkt.repository;

import fi.oph.vkt.model.Payment;
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
}
