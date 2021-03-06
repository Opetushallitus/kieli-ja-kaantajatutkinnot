package fi.oph.otr.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.otr.Factory;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.EmailRepository;
import fi.oph.otr.repository.QualificationReminderRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.service.LanguageService;
import fi.oph.otr.util.TemplateRenderer;
import java.time.LocalDate;
import java.util.Map;
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
public class ClerkEmailServiceTest {

  private ClerkEmailService clerkEmailService;

  @Resource
  private QualificationRepository qualificationRepository;

  @MockBean
  private QualificationReminderRepository qualificationReminderRepository;

  @Resource
  private EmailRepository emailRepository;

  @MockBean
  private EmailService emailService;

  @MockBean
  private OnrService onrService;

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<EmailData> emailDataCaptor;

  @BeforeEach
  public void setup() {
    final LanguageService languageService = new LanguageService();
    languageService.init();

    clerkEmailService =
      new ClerkEmailService(
        qualificationRepository,
        qualificationReminderRepository,
        emailRepository,
        emailService,
        languageService,
        onrService,
        templateRenderer
      );
  }

  @Test
  public void testCreateQualificationExpiryEmail() {
    final Interpreter interpreter = Factory.interpreter();
    final Qualification qualification = Factory.qualification(interpreter);

    qualification.setFromLang("FI");
    qualification.setToLang("EN");
    qualification.setBeginDate(LocalDate.of(2020, 1, 1));
    qualification.setEndDate(LocalDate.of(2049, 12, 1));

    entityManager.persist(interpreter);
    entityManager.persist(qualification);

    when(onrService.getCachedPersonalDatas())
      .thenReturn(
        Map.of(
          interpreter.getOnrId(),
          PersonalData
            .builder()
            .lastName("Rajala")
            .firstName("Iiro Aapeli")
            .nickName("Iiro")
            .identityNumber("1")
            .email("iiro.rajala@example.invalid")
            .build()
        )
      );

    final Map<String, Object> expectedTemplateParams = Map.of(
      "interpreterName",
      "Iiro Rajala",
      "langPair",
      "suomi - englanti",
      "expiryDate",
      "01.12.2049"
    );

    when(templateRenderer.renderQualificationExpiryEmailBody(expectedTemplateParams))
      .thenReturn("Merkint??si p????ttyy 01.12.2049");

    clerkEmailService.createQualificationExpiryEmail(qualification.getId());

    verify(emailService).saveEmail(any(), emailDataCaptor.capture());

    final EmailData emailData = emailDataCaptor.getValue();

    assertEquals("Iiro Rajala", emailData.recipientName());
    assertEquals("iiro.rajala@example.invalid", emailData.recipientAddress());
    assertEquals("Merkint??si oikeustulkkirekisteriin on p????ttym??ss??", emailData.subject());
    assertEquals("Merkint??si p????ttyy 01.12.2049", emailData.body());

    verify(qualificationReminderRepository).save(any());
  }
}
