package fi.oph.akt.repository;

import fi.oph.akt.model.Translator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranslatorRepository extends JpaRepository<Translator, Long> {

	// @formatter:off
	@Query("SELECT DISTINCT t FROM Translator t" +
			" JOIN t.authorisations aut" +
			" JOIN aut.terms term" +
			" JOIN aut.languagePairs pair" +
			" WHERE pair.permissionToPublish=true" +
			" AND CURRENT_DATE >= term.beginDate" +
			" AND (CURRENT_DATE <= term.endDate OR term.endDate IS NULL)")
	// @formatter:on
	List<Translator> findTranslatorsForPublicListing();

}
