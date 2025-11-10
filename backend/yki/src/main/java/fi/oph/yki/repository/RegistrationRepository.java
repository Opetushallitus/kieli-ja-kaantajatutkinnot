package fi.oph.yki.repository;

import fi.oph.yki.api.dto.clerk.ClerkCustomerRegistrationDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamLocationDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationStatusDTO;
import fi.oph.yki.model.Registration;
import jakarta.persistence.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> getByPersonOid(String personOid);
}

