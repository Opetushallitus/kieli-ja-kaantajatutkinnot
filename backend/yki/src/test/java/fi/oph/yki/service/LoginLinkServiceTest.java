package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.LoginLink;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.LoginLinkType;
import fi.oph.yki.repository.LoginLinkRepository;
import fi.oph.yki.util.StringUtil;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class LoginLinkServiceTest {

  @Resource
  private LoginLinkRepository loginLinkRepository;

  @Resource
  private Environment environment;

  @Resource
  private TestEntityManager entityManager;

  private LoginLinkService loginLinkService;

  @BeforeEach
  void setup() {
    loginLinkService = new LoginLinkService(loginLinkRepository, environment);
  }

  @Test
  void testCreateUserPortalLink() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    final Participant participant = Factory.participant("testi.henkilo@example.com");
    registration.setParticipant(participant);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(registration);

    final String link = loginLinkService.createUserPortalLink(participant, registration);

    final List<LoginLink> loginLinks = loginLinkRepository.findAll();
    assertEquals(1, loginLinks.size());
    final LoginLink loginLink = loginLinks.get(0);

    assertEquals(participant.getId(), loginLink.getParticipant().getId());
    assertEquals(registration.getId(), loginLink.getRegistration().getId());
    assertEquals(LoginLinkType.PERSON, loginLink.getType());
    assertEquals(environment.getRequiredProperty("app.user-portal.success-url"), loginLink.getSuccessRedirect());
    assertEquals(environment.getRequiredProperty("app.user-portal.expired-url"), loginLink.getExpiredLinkRedirect());
    assertTrue(loginLink.getExpiresAt().isAfter(LocalDateTime.now().plusDays(14)));

    assertTrue(link.startsWith(environment.getRequiredProperty("app.base-url.public") + "/auth/login?code="));
    final String code = link.substring(link.indexOf("code=") + "code=".length());
    assertNotEquals(code, loginLink.getCode());
    assertEquals(StringUtil.sha256hex(code), loginLink.getCode());
  }
}
