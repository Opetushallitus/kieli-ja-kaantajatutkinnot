package fi.oph.akr.repository;

import fi.oph.akr.model.Translator;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TranslatorRepository extends JpaRepository<Translator, Long> {
  List<Translator> findAllByOrderByLastNameAscFirstNameAsc();
}
