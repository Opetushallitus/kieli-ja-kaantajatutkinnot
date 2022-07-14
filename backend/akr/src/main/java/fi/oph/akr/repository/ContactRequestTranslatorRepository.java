package fi.oph.akr.repository;

import fi.oph.akr.model.ContactRequestTranslator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestTranslatorRepository extends JpaRepository<ContactRequestTranslator, Long> {}
