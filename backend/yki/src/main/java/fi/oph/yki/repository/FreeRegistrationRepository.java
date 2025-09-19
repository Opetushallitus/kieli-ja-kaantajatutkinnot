package fi.oph.yki.repository;

import fi.oph.yki.model.FreeRegistration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeRegistrationRepository extends JpaRepository<FreeRegistration, Long> {
  @Query("SELECT fr" + " FROM FreeRegistration fr" + " WHERE fr.source = 'USER'")
  List<FreeRegistration> findApprovals();
}
