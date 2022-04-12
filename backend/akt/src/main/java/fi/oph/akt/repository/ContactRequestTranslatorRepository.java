package fi.oph.akt.repository;

import fi.oph.akt.model.ContactRequestTranslator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestTranslatorRepository extends JpaRepository<ContactRequestTranslator, Long> {}
