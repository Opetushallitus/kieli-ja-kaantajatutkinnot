package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Email;
import fi.oph.vkt.model.EmailAttachment;
import fi.oph.vkt.model.EmailType;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EmailAttachmentRepository;
import fi.oph.vkt.repository.EmailRepository;
import fi.oph.vkt.service.email.EmailService;
import fi.oph.vkt.service.email.sender.EmailSender;
import fi.oph.vkt.service.receipt.ReceiptData;
import fi.oph.vkt.service.receipt.ReceiptItem;
import fi.oph.vkt.service.receipt.ReceiptRenderer;
import fi.oph.vkt.util.TemplateRenderer;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PublicEnrollmentEmailServiceTest {

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

  private PublicEnrollmentEmailService publicEnrollmentEmailService;

  @BeforeEach
  public void setup() throws IOException, InterruptedException {
    final EmailService emailService = new EmailService(emailRepository, emailAttachmentRepository, emailSender);
    final ReceiptRenderer receiptRenderer = mock(ReceiptRenderer.class);

    when(receiptRenderer.getReceiptData(anyLong(), any()))
      .thenReturn(
        ReceiptData
          .builder()
          .dateOfReceipt("20.02.2025")
          .payerName("Payer")
          .paymentDate("19.02.2025")
          .totalAmount("500")
          .item(ReceiptItem.builder().name("A").value("B").additionalInfos(List.of()).build())
          .build()
      );
    when(receiptRenderer.getReceiptPdfBytes(any())).thenReturn(new byte[] { 'a', 'b', 'c' });

    publicEnrollmentEmailService = new PublicEnrollmentEmailService(emailService, receiptRenderer, templateRenderer);
  }

  @Test
  public void testSendEnrollmentConfirmationEmail() throws IOException, InterruptedException {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setLanguage(ExamLanguage.FI);
    examEvent.setLevel(ExamLevel.EXCELLENT);
    examEvent.setDate(LocalDate.of(2025, 3, 12));

    final Person person = Factory.person();
    person.setFirstName("Foo");
    person.setLastName("Bar");

    // Enrollment with oral skill and both its partial exams set
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setOralSkill(true);
    enrollment.setTextualSkill(false);
    enrollment.setUnderstandingSkill(false);
    enrollment.setSpeakingPartialExam(true);
    enrollment.setSpeechComprehensionPartialExam(true);
    enrollment.setWritingPartialExam(false);
    enrollment.setReadingComprehensionPartialExam(false);
    enrollment.setEmail("foo.bar@vkt.test");

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final Map<String, Object> expectedTemplateParams = Map.of(
      "examLanguageFI",
      "suomi",
      "examLanguageSV",
      "finska",
      "examLevelFI",
      "erinomainen",
      "examLevelSV",
      "utmärkt",
      "examDate",
      "12.03.2025",
      "skillsFI",
      "suullinen taito",
      "skillsSV",
      "suullinen taito",
      "partialExamsFI",
      "puhuminen, puheen ymmärtäminen",
      "partialExamsSV",
      "puhuminen, puheen ymmärtäminen"
    );

    when(templateRenderer.renderEnrollmentConfirmationEmailBody(expectedTemplateParams))
      .thenReturn("<html>enrollment</html>");

    publicEnrollmentEmailService.sendEnrollmentConfirmationEmail(enrollment, person);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    final Email email = emails.get(0);

    assertEquals(EmailType.ENROLLMENT_CONFIRMATION, email.getEmailType());
    assertEquals("Foo Bar", email.getRecipientName());
    assertEquals("foo.bar@vkt.test", email.getRecipientAddress());
    assertTrue(email.getSubject().contains("Vahvistus tutkintoon ilmoittautumisesta"));
    assertEquals("<html>enrollment</html>", email.getBody());
    assertNull(email.getSentAt());
    assertNull(email.getError());
    assertNull(email.getExtId());

    final List<EmailAttachment> attachments = email.getAttachments();
    assertEquals(2, attachments.size());
    final EmailAttachment attachment = attachments.get(0);

    assertTrue(attachments.stream().anyMatch(a -> a.getName().equals("Maksukuitti 20.02.2025.pdf")));
    assertTrue(attachments.stream().anyMatch(a -> a.getName().equals("Betalningkvittot 20.02.2025.pdf")));
    assertTrue(attachments.stream().allMatch(a -> attachment.getContentType().equals("application/pdf")));
  }

  @Test
  public void testSendEnrollmentToQueueConfirmationEmail() throws IOException, InterruptedException {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setLanguage(ExamLanguage.SV);
    examEvent.setLevel(ExamLevel.EXCELLENT);
    examEvent.setDate(LocalDate.of(2025, 3, 12));

    final Person person = Factory.person();
    person.setFirstName("Foo");
    person.setLastName("Bar");

    // Enrollment with textual and understanding skills, and all their partial exams set
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setOralSkill(false);
    enrollment.setTextualSkill(true);
    enrollment.setUnderstandingSkill(true);
    enrollment.setSpeakingPartialExam(false);
    enrollment.setSpeechComprehensionPartialExam(true);
    enrollment.setWritingPartialExam(true);
    enrollment.setReadingComprehensionPartialExam(true);
    enrollment.setEmail("foo.bar@vkt.test");

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final Map<String, Object> expectedTemplateParams = Map.of(
      "examLanguageFI",
      "ruotsi",
      "examLanguageSV",
      "svenska",
      "examLevelFI",
      "erinomainen",
      "examLevelSV",
      "utmärkt",
      "examDate",
      "12.03.2025",
      "skillsFI",
      "kirjallinen taito, ymmärtämisen taito",
      "skillsSV",
      "kirjallinen taito, ymmärtämisen taito",
      "partialExamsFI",
      "kirjoittaminen, tekstin ymmärtäminen, puheen ymmärtäminen",
      "partialExamsSV",
      "kirjoittaminen, tekstin ymmärtäminen, puheen ymmärtäminen"
    );

    when(templateRenderer.renderEnrollmentToQueueConfirmationEmailBody(expectedTemplateParams))
      .thenReturn("<html>enrollment-to-queue</html>");

    publicEnrollmentEmailService.sendEnrollmentToQueueConfirmationEmail(enrollment, person);

    final List<Email> emails = emailRepository.findAll();
    assertEquals(1, emails.size());
    final Email email = emails.get(0);

    assertEquals(EmailType.ENROLLMENT_TO_QUEUE_CONFIRMATION, email.getEmailType());
    assertEquals("Foo Bar", email.getRecipientName());
    assertEquals("foo.bar@vkt.test", email.getRecipientAddress());
    assertTrue(email.getSubject().contains("Vahvistus ilmoittautumisesta tutkinnon jonotuspaikalle"));
    assertEquals("<html>enrollment-to-queue</html>", email.getBody());
    assertNull(email.getSentAt());
    assertNull(email.getError());
    assertNull(email.getExtId());

    assertEquals(0, email.getAttachments().size());
  }
}
