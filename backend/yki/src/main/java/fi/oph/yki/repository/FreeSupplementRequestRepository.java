package fi.oph.yki.repository;

import fi.oph.yki.model.FreeComment;
import fi.oph.yki.model.FreeSupplementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeSupplementRequestRepository extends JpaRepository<FreeSupplementRequest, Long> {}
