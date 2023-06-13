package fi.oph.vkt.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Email;
import fi.oph.vkt.repository.EmailRepository;
import fi.oph.vkt.service.email.EmailService;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;
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
class EmailScheduledSendingTest {

  private EmailScheduledSending emailScheduledSending;

  @Resource
  private EmailRepository emailRepository;

  @MockBean
  private EmailService emailService;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<Long> longCaptor;

  @BeforeEach
  public void setup() {
    emailScheduledSending = new EmailScheduledSending(emailRepository, emailService);
  }

  @Test
  public void testPollEmailsToSendSendsOnlyUnsentEmails() {
    createEmail(LocalDateTime.now(), null); // sent
    final long unsentId = createEmail(null, null).getId();
    createEmail(LocalDateTime.now(), "error msg"); // sentWasInError
    final long unsentInErrorId = createEmail(null, "error msg").getId();

    emailScheduledSending.action();

    verify(emailService, times(2)).sendEmail(longCaptor.capture());

    assertEquals(List.of(unsentId, unsentInErrorId), longCaptor.getAllValues());
  }

  @Test
  public void testOlderModifiedIsSentFirst() {
    final Email email1 = createEmail(null, null);
    final Email email2 = createEmail(null, null);
    final Email email3 = createEmail(null, null);
    final Email email4 = createEmail(null, null);
    final Email email5 = createEmail(null, null);

    changeEmail(email3);
    changeEmail(email2);
    changeEmail(email1);
    changeEmail(email5);
    changeEmail(email4);

    emailScheduledSending.action();

    verify(emailService, times(5)).sendEmail(longCaptor.capture());

    assertEquals(
      Stream.of(email3, email2, email1, email5, email4).map(Email::getId).toList(),
      longCaptor.getAllValues()
    );
  }

  @Test
  public void testBatchSize() {
    IntStream.range(0, EmailScheduledSending.BATCH_SIZE + 1).forEach(n -> createEmail(null, null));

    emailScheduledSending.action();
    verify(emailService, times(EmailScheduledSending.BATCH_SIZE)).sendEmail(anyLong());
  }

  private Email createEmail(final LocalDateTime sentAt, final String error) {
    final Email email = Factory.email();
    email.setSentAt(sentAt);
    email.setError(error);
    return entityManager.persist(email);
  }

  private void changeEmail(final Email email) {
    email.setBody(email.getBody() + "x");
    entityManager.persistAndFlush(email);
  }
}
