package fi.oph.vkt.repository;

import fi.oph.vkt.model.Payment;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends BaseRepository<Payment> {
  @Query(value = "SELECT * FROM payment p WHERE p.payment_id = :paymentId FOR UPDATE", nativeQuery = true)
  Optional<Payment> findWithLockingById(@Param("paymentId") final Long paymentId);
}
