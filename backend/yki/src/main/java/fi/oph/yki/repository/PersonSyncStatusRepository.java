package fi.oph.yki.repository;

import fi.oph.yki.model.PersonSyncStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonSyncStatusRepository extends JpaRepository<PersonSyncStatus, Long> {}
