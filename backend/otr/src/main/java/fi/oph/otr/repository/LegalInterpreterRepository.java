package fi.oph.otr.repository;

import fi.oph.otr.model.Oikeustulkki;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalInterpreterRepository extends JpaRepository<Oikeustulkki, Long> {
  @Query(
    "SELECT new fi.oph.otr.repository.InterpreterLegalInterpreterProjection(t.id, o.julkaisulupaEmail," +
    " o.julkaisulupaPuhelinnumero, o.julkaisulupaMuuYhteystieto, o.muuYhteystieto) FROM Oikeustulkki o" +
    " JOIN o.tulkki t" +
    " WHERE o.julkaisulupa = true" +
    " AND o.poistettu = false" +
    " AND t.poistettu = false"
  )
  List<InterpreterLegalInterpreterProjection> findLegalInterpretersForPublicListing();
}
