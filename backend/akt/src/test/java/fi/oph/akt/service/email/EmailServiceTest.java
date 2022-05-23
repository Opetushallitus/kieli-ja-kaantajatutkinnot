package fi.oph.akt.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.akt.Factory;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.repository.EmailRepository;
import fi.oph.akt.service.email.sender.EmailSender;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
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
    final EmailData emailData = EmailData
      .builder()
      .recipientName("Vastaanottaja")
      .recipientAddress("vastaanottaja@invalid")
      .subject("testiotsikko")
      .body("testiviesti")
      .build();

    final Long emailId = emailService.saveEmail(EmailType.CONTACT_REQUEST_TRANSLATOR, emailData);
    final Email email = emailRepository.getById(emailId);

    assertEquals(EmailType.CONTACT_REQUEST_TRANSLATOR, email.getEmailType());
    assertEquals("Vastaanottaja", email.getRecipientName());
    assertEquals("vastaanottaja@invalid", email.getRecipientAddress());
    assertEquals("testiotsikko", email.getSubject());
    assertEquals("testiviesti", email.getBody());
    assertNull(email.getSentAt());
    assertNull(email.getError());
    assertNull(email.getExtId());

    final List<Email> allEmails = emailRepository.findAll();
    assertEquals(1, allEmails.size());
  }

  @Test
  public void saveEmailSavesOnlyTheEmailFromAddressTest() {
    final EmailData emailData = EmailData
      .builder()
      .recipientName("Vastaanottaja")
      .recipientAddress("Erkki Esimerkki <vastaanottaja@invalid>")
      .subject("testiotsikko")
      .body("testiviesti")
      .build();

    final Long emailId = emailService.saveEmail(EmailType.CONTACT_REQUEST_TRANSLATOR, emailData);
    final Email email = emailRepository.getById(emailId);

    assertEquals(EmailType.CONTACT_REQUEST_TRANSLATOR, email.getEmailType());
    assertEquals("Vastaanottaja", email.getRecipientName());
    assertEquals("vastaanottaja@invalid", email.getRecipientAddress());
    assertEquals("testiotsikko", email.getSubject());
    assertEquals("testiviesti", email.getBody());
    assertNull(email.getSentAt());
    assertNull(email.getError());
    assertNull(email.getExtId());

    final List<Email> allEmails = emailRepository.findAll();
    assertEquals(1, allEmails.size());
  }

  @Test
  public void sendEmailSuccessTest() throws JsonProcessingException {
    final Email email = Factory.email(EmailType.CONTACT_REQUEST_TRANSLATOR);
    final Email savedEmail = entityManager.persist(email);
    when(emailSenderMock.sendEmail(any())).thenReturn("12345");

    emailService.sendEmail(savedEmail.getId());

    final Email updatedEmail = emailRepository.getById(savedEmail.getId());
    assertNotNull(updatedEmail.getSentAt());
    assertEquals("12345", updatedEmail.getExtId());
    assertNull(updatedEmail.getError());

    verify(emailSenderMock).sendEmail(emailDataCaptor.capture());

    assertEquals(savedEmail.getRecipientName(), emailDataCaptor.getValue().recipientName());
    assertEquals(savedEmail.getRecipientAddress(), emailDataCaptor.getValue().recipientAddress());
    assertEquals(savedEmail.getSubject(), emailDataCaptor.getValue().subject());
    assertEquals(savedEmail.getBody(), emailDataCaptor.getValue().body());
  }

  @Test
  public void sendEmailFailureTest() throws JsonProcessingException {
    final Email email = Factory.email(EmailType.CONTACT_REQUEST_TRANSLATOR);
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

  @Test
  public void cleanAddressTest() {
    assertNull(EmailService.cleanAddress(null));
    assertEquals("", EmailService.cleanAddress(""));
    assertEquals("a", EmailService.cleanAddress("a"));
    assertEquals("a@b.c", EmailService.cleanAddress("a@b.c"));
    assertEquals("<a@b.c", EmailService.cleanAddress("<a@b.c"));
    assertEquals("a@b.c>", EmailService.cleanAddress("a@b.c>"));
    assertEquals("a@b.c", EmailService.cleanAddress("<a@b.c>"));
    assertEquals("a@b.c", EmailService.cleanAddress("Name of the recipient <a@b.c>"));
  }
}
