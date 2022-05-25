package fi.oph.otr.repository;

import fi.oph.otr.model.QualificationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QualificationReminderRepository extends JpaRepository<QualificationReminder, Long> {}
