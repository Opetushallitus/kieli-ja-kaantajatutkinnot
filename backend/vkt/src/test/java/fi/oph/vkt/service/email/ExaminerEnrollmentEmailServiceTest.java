package fi.oph.vkt.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Email;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.EmailAttachmentRepository;
import fi.oph.vkt.repository.EmailRepository;
import fi.oph.vkt.service.ExaminerEnrollmentEmailService;
import fi.oph.vkt.service.email.sender.EmailSender;
import fi.oph.vkt.util.TemplateRenderer;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExaminerEnrollmentEmailServiceTest {

  @Resource
  private EmailRepository emailRepository;

  @Resource
  private EmailAttachmentRepository emailAttachmentRepository;

  @MockBean
  private EmailSender emailSender;

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private TestEntityManager entityManager;

  private ExaminerEnrollmentEmailService examinerEnrollmentEmailService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.base-url.api")).thenReturn("http://localhost");

    final EmailService emailService = new EmailService(emailRepository, emailAttachmentRepository, emailSender);

    examinerEnrollmentEmailService = new ExaminerEnrollmentEmailService(emailService, environment, templateRenderer);
  }

  @Test
  public void testSendAuthLink() throws IOException, InterruptedException {
    final Examiner examiner = Factory.examiner();
    final Municipality municipality = Factory.municipality();
    final ExaminerExamEvent examEvent = Factory.examinerExamEvent(examiner, municipality);
    final Person person = Factory.person();
    final EnrollmentAppointment enrollment = Factory.enrollmentAppointment(examiner, examEvent, person);

    when(templateRenderer.renderEnrollmentAppointmentAuthLink(anyMap())).thenReturn("email body");

    entityManager.persist(examiner);
    entityManager.persist(municipality);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    examinerEnrollmentEmailService.sendEnrollmentAppointmentAuthLink(enrollment);

    final List<Long> emails = emailRepository.findEmailsToSend(PageRequest.ofSize(10));
    final Email email = emailRepository.getReferenceById(emails.get(0));

    assertEquals(1, emails.size());
    assertEquals(
      "Ilmoittautuminen Valtionhallinnon kielitutkintoon (VKT) | Anmälan till Språkexamen för statsförvaltningen (VKT)",
      email.getSubject()
    );
    assertEquals("foo.tester@invalid", email.getRecipientAddress());
    assertEquals("Irma Ilmoittautuja", email.getRecipientName());
    assertEquals(EmailType.ENROLLMENT_APPOINTMENT_AUTH_LINK, email.getEmailType());
  }
}
