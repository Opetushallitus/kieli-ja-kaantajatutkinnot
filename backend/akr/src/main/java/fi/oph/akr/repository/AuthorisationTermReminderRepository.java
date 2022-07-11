package fi.oph.akr.repository;

import fi.oph.akr.model.AuthorisationTermReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorisationTermReminderRepository extends JpaRepository<AuthorisationTermReminder, Long> {}
