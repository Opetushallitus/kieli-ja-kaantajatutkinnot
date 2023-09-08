package fi.oph.akr.repository;

import fi.oph.akr.model.Translator;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TranslatorRepository extends BaseRepository<Translator> {
  @Query("SELECT t FROM Translator t WHERE t.deletedAt IS NULL")
  List<Translator> findExistingTranslators();

  @Query("SELECT t.onrId FROM Translator t WHERE t.deletedAt IS NULL")
  List<String> listExistingOnrIds();
}
