package fi.oph.akr.repository;

import fi.oph.akr.model.Translator;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface TranslatorRepository extends BaseRepository<Translator> {
  List<Translator> findAllByOrderByLastNameAscFirstNameAsc();
}
