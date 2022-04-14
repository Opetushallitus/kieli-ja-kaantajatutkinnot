package fi.oph.otr.repository;

import fi.oph.otr.model.Kielipari;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LanguagePairRepository extends JpaRepository<Kielipari, Long> {
  @Query(
    "SELECT new fi.oph.otr.repository.TranslatorLanguagePairProjection(o.tulkki.id, kp.kielesta.koodi, kp.kieleen.koodi) FROM Kielipari kp" +
    " JOIN kp.oikeustulkki o" +
    " WHERE kp.voimassaoloAlkaa <= CURRENT_DATE" +
    " AND CURRENT_DATE <= kp.voimassaoloPaattyy" +
    " AND o.julkaisulupa = true"
  )
  List<TranslatorLanguagePairProjection> findLanguagePairsForPublicListing();
}
