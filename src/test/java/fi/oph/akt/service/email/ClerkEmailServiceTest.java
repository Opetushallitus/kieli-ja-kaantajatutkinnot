package fi.oph.akt.service.email;

import fi.oph.akt.Factory;
import fi.oph.akt.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationTerm;
import fi.oph.akt.model.LanguagePair;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.TranslatorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;

import javax.annotation.Resource;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@DataJpaTest
public class ClerkEmailServiceTest {

	private ClerkEmailService clerkEmailService;

	@MockBean
	private EmailService emailService;

	@Resource
	private TranslatorRepository translatorRepository;

	@Resource
	private TestEntityManager entityManager;

	@Captor
	private ArgumentCaptor<EmailData> emailDataCaptor;

	@BeforeEach
	public void setup() {
		clerkEmailService = new ClerkEmailService(emailService, translatorRepository);
	}

	@Test
	public void createInformalEmailsShouldSaveEmailsToGivenTranslators() {
		final MeetingDate meetingDate = Factory.meetingDate();
		entityManager.persist(meetingDate);

		IntStream.range(0, 3).forEach(n -> {
			final Translator translator = Factory.translator();
			final Authorisation authorisation = Factory.authorisation(translator, meetingDate);
			final LanguagePair languagePair = Factory.languagePair(authorisation);
			final AuthorisationTerm authorisationTerm = Factory.authorisationTerm(authorisation);

			entityManager.persist(translator);
			entityManager.persist(authorisation);
			entityManager.persist(languagePair);
			entityManager.persist(authorisationTerm);
		});

		List<Long> translatorIds = translatorRepository.findAll().stream().map(Translator::getId).toList();

		InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO.builder().translatorIds(translatorIds)
				.subject("otsikko").body("viesti").build();

		clerkEmailService.createInformalEmails(emailRequestDTO);

		verify(emailService, times(3)).saveEmail(any(), emailDataCaptor.capture());

		List<EmailData> emailDatas = emailDataCaptor.getAllValues();

		assertEquals(3, emailDatas.size());

		emailDatas.forEach(emailData -> {
			assertEquals("AKT", emailData.sender());
			assertEquals("otsikko", emailData.subject());
			assertEquals("viesti", emailData.body());
		});
	}

	@Test
	public void createInformalEmailsShouldSaveEmailToGivenTranslatorsWithDuplicateTranslatorIds() {
		final MeetingDate meetingDate = Factory.meetingDate();
		final Translator translator = Factory.translator();
		final Authorisation authorisation = Factory.authorisation(translator, meetingDate);
		final LanguagePair languagePair = Factory.languagePair(authorisation);
		final AuthorisationTerm authorisationTerm = Factory.authorisationTerm(authorisation);

		entityManager.persist(meetingDate);
		entityManager.persist(translator);
		entityManager.persist(authorisation);
		entityManager.persist(languagePair);
		entityManager.persist(authorisationTerm);

		Long tId = translatorRepository.findAll().get(0).getId();

		InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO.builder().translatorIds(List.of(tId, tId))
				.subject("otsikko").body("viesti").build();

		clerkEmailService.createInformalEmails(emailRequestDTO);

		verify(emailService).saveEmail(any(), emailDataCaptor.capture());
	}

	@Test
	public void createInformalEmailsShouldThrowIllegalArgumentExceptionForNonExistingTranslatorIds() {
		InformalEmailRequestDTO emailRequestDTO = InformalEmailRequestDTO.builder().translatorIds(List.of(1L))
				.subject("otsikko").body("viesti").build();

		assertThrows(IllegalArgumentException.class, () -> clerkEmailService.createInformalEmails(emailRequestDTO));
	}

}
