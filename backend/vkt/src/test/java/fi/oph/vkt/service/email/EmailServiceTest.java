package fi.oph.vkt.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Email;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.repository.EmailRepository;
import fi.oph.vkt.service.email.sender.EmailSender;
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

    final Long emailId = emailService.saveEmail(EmailType.ENROLLMENT_CONFIRMATION, emailData);
    final Email email = emailRepository.getReferenceById(emailId);

    assertEquals(EmailType.ENROLLMENT_CONFIRMATION, email.getEmailType());
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
    final Email email = Factory.email();
    final Email savedEmail = entityManager.persist(email);
    when(emailSenderMock.sendEmail(any())).thenReturn("12345");

    emailService.sendEmail(savedEmail.getId());

    final Email updatedEmail = emailRepository.getReferenceById(savedEmail.getId());
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
    final Email email = Factory.email();
    final Email savedEmail = entityManager.persist(email);

    doThrow(new RuntimeException("error msg")).when(emailSenderMock).sendEmail(any());

    emailService.sendEmail(savedEmail.getId());

    final Email updatedEmail = emailRepository.getReferenceById(savedEmail.getId());
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
