package fi.oph.yki.repository;

import fi.oph.yki.model.PaymentLink;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentLinkRepository extends BaseRepository<PaymentLink> {
  @EntityGraph(attributePaths = { "identity", "registration.examSession" })
  Optional<PaymentLink> findByCode(final String code);
}
