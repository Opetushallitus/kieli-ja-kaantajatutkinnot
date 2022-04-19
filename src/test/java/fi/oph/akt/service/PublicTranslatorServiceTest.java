package fi.oph.akt.service;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import fi.oph.akt.api.dto.PublicTranslatorDTO;
import fi.oph.akt.api.dto.PublicTranslatorResponseDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationTerm;
import fi.oph.akt.model.LanguagePair;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.onr.OnrServiceMock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Import({ PublicTranslatorService.class, OnrServiceMock.class })
class PublicTranslatorServiceTest {

	@Autowired
	private TestEntityManager entityManager;

	@Autowired
	private PublicTranslatorService publicTranslatorService;

	@Test
	public void listTranslatorsShouldReturnTranslatorsWithActiveTermAndHavingLanguagePairsWithPermissionToBePublished() {
		final MeetingDate meetingDate = Factory.meetingDate();
		entityManager.persist(meetingDate);

		createVariousTranslators(meetingDate);

		final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();
		final List<PublicTranslatorDTO> translators = responseDTO.translators();

		assertEquals(3, translators.size());
	}

	@Test
	public void listTranslatorsShouldReturnDistinctFromAndToLanguages() {
		final MeetingDate meetingDate = Factory.meetingDate();
		entityManager.persist(meetingDate);

		createVariousTranslators(meetingDate);

		final PublicTranslatorResponseDTO responseDTO = publicTranslatorService.listTranslators();
		final LanguagePairsDictDTO languagePairsDictDTO = responseDTO.langs();

		assertEquals(List.of("FI"), languagePairsDictDTO.from());
		assertEquals(List.of("EN"), languagePairsDictDTO.to());
	}

	private void createVariousTranslators(MeetingDate meetingDate) {
		// Term active
		createTranslator(meetingDate, LocalDate.now(), LocalDate.now().plusDays(1), true);

		// Term active
		createTranslator(meetingDate, LocalDate.now().minusDays(1), LocalDate.now(), true);

		// Term active (no end date)
		createTranslator(meetingDate, LocalDate.now(), null, true);

		// Term active but no permission given
		createTranslator(meetingDate, LocalDate.now().minusDays(10), LocalDate.now().plusDays(10), false);

		// Term ended
		createTranslator(meetingDate, LocalDate.now().minusDays(10), LocalDate.now().minusDays(1), true);

		// Term in future
		createTranslator(meetingDate, LocalDate.now().plusDays(1), LocalDate.now().plusDays(10), true);

		// Term in future (no end date)
		createTranslator(meetingDate, LocalDate.now().plusDays(1), null, true);
	}

	private void createTranslator(final MeetingDate meetingDate, final LocalDate beginDate, final LocalDate endDate,
			final boolean permissionToPublish) {

		final Translator translator = Factory.translator();
		final Authorisation authorisation = Factory.authorisation(translator, meetingDate);

		final LanguagePair languagePair = Factory.languagePair(authorisation);
		languagePair.setFromLang("FI");
		languagePair.setToLang("EN");
		languagePair.setPermissionToPublish(permissionToPublish);

		final AuthorisationTerm authorisationTerm = Factory.authorisationTerm(authorisation);
		authorisationTerm.setBeginDate(beginDate);
		authorisationTerm.setEndDate(endDate);

		entityManager.persist(translator);
		entityManager.persist(authorisation);
		entityManager.persist(languagePair);
		entityManager.persist(authorisationTerm);
	}

}
