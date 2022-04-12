package fi.oph.akt.repository;

import fi.oph.akt.model.AuthorisationTermReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorisationTermReminderRepository extends JpaRepository<AuthorisationTermReminder, Long> {}
