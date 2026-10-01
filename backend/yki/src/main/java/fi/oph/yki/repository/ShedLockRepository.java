package fi.oph.yki.repository;

import fi.oph.yki.model.ShedLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShedLockRepository extends JpaRepository<ShedLock, String> {}
