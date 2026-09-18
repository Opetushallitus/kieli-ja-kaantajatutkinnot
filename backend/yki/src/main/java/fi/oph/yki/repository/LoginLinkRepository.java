package fi.oph.yki.repository;

import fi.oph.yki.model.LoginLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginLinkRepository extends JpaRepository<LoginLink, Long> {}
