package fi.oph.vkt.repository;

import fi.oph.vkt.model.Payment;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends BaseRepository<Payment> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @QueryHints({ @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000") })
  @Override
  Optional<Payment> findById(final Long paymentId);
}
