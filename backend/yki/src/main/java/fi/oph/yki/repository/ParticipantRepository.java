package fi.oph.yki.repository;

import fi.oph.yki.model.Participant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
  Optional<Participant> findByExternalUserId(String externalUserId);
}
