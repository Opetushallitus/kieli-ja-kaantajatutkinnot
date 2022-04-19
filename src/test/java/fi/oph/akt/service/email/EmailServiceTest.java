package fi.oph.akt.service.email;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.akt.Factory;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.repository.EmailRepository;
import fi.oph.akt.service.email.sender.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;

import javax.annotation.Resource;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@DataJpaTest
class EmailServiceTest {

	private EmailService emailService;

	@Resource
	private EmailRepository emailRepository;

	@MockBean
	private EmailSender emailSenderMock;

	@Resource
	private TestEntityManager entityManager;

	@Captor
	private ArgumentCaptor<EmailData> emailDataCaptor;

	@BeforeEach
	public void setup() {
		emailService = new EmailService(emailRepository, emailSenderMock);
	}

	@Test
	public void saveEmailTest() {
		final EmailData emailData = EmailData.builder().sender("lähettäjä").recipient("vastaanottaja@invalid")
				.subject("testiotsikko").body("testiviesti").build();
		final Long savedId = emailService.saveEmail(EmailType.CONTACT_REQUEST, emailData);

		final List<Email> all = emailRepository.findAll();
		assertEquals(1, all.size());

		final Email persistedEmail = all.get(0);
		assertEquals(savedId, persistedEmail.getId());
		assertEquals(EmailType.CONTACT_REQUEST, persistedEmail.getEmailType());
		assertEquals("lähettäjä", persistedEmail.getSender());
		assertEquals("vastaanottaja@invalid", persistedEmail.getRecipient());
		assertEquals("testiotsikko", persistedEmail.getSubject());
		assertEquals("testiviesti", persistedEmail.getBody());
		assertNull(persistedEmail.getSentAt());
		assertNull(persistedEmail.getError());
		assertNull(persistedEmail.getExtId());
	}

	@Test
	public void sendEmailSuccessTest() throws JsonProcessingException {
		final Email email = Factory.email(EmailType.CONTACT_REQUEST);
		final Email savedEmail = entityManager.persist(email);
		when(emailSenderMock.sendEmail(any())).thenReturn("12345");

		emailService.sendEmail(savedEmail.getId());

		final Email updatedEmail = emailRepository.getById(savedEmail.getId());
		assertNotNull(updatedEmail.getSentAt());
		assertEquals("12345", updatedEmail.getExtId());
		assertNull(updatedEmail.getError());

		verify(emailSenderMock).sendEmail(emailDataCaptor.capture());
		assertEquals(savedEmail.getSender(), emailDataCaptor.getValue().sender());
		assertEquals(savedEmail.getRecipient(), emailDataCaptor.getValue().recipient());
		assertEquals(savedEmail.getSubject(), emailDataCaptor.getValue().subject());
		assertEquals(savedEmail.getBody(), emailDataCaptor.getValue().body());
	}

	@Test
	public void sendEmailFailureTest() throws JsonProcessingException {
		final Email email = Factory.email(EmailType.CONTACT_REQUEST);
		final Email savedEmail = entityManager.persist(email);

		doThrow(new RuntimeException("error msg")).when(emailSenderMock).sendEmail(any());

		emailService.sendEmail(savedEmail.getId());

		final Email updatedEmail = emailRepository.getById(savedEmail.getId());
		assertNull(updatedEmail.getSentAt());
		assertNull(updatedEmail.getExtId());
		assertEquals("error msg", updatedEmail.getError());
	}

	@Test
	public void sendEmailNonExistingIdTest() {
		// sanity check to make sure there are no emails in database
		assertEquals(0, emailRepository.findAll().size());

		emailService.sendEmail(111);

		verifyNoInteractions(emailSenderMock);
	}

}