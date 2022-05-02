package fi.oph.otr.repository;

import fi.oph.otr.model.Kielipari;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LanguagePairRepository extends JpaRepository<Kielipari, Long> {
  @Query(
    "SELECT new fi.oph.otr.repository.InterpreterLanguagePairProjection(o.tulkki.id, kp.kielesta.koodi, kp.kieleen.koodi) FROM Kielipari kp" +
    " JOIN kp.oikeustulkki o" +
    " JOIN o.tulkki t" +
    " WHERE kp.voimassaoloAlkaa <= CURRENT_DATE" +
    " AND CURRENT_DATE <= kp.voimassaoloPaattyy" +
    " AND o.julkaisulupa = true" +
    " AND o.poistettu = false" +
    " AND t.poistettu = false"
  )
  List<InterpreterLanguagePairProjection> findLanguagePairsForPublicListing();
}
