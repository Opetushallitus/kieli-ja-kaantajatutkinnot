package fi.oph.yki.repository;

import fi.oph.yki.model.RegistrationChangeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationChangeEventRepository extends JpaRepository<RegistrationChangeEvent, Long> {}
