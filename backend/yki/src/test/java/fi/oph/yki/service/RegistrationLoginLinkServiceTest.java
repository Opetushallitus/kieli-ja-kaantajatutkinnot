package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationLoginLink;
import fi.oph.yki.repository.RegistrationLoginLinkRepository;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.UUIDSource;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class RegistrationLoginLinkServiceTest {

  @Resource
  private RegistrationLoginLinkRepository registrationLoginLinkRepository;

  @Resource
  private TestEntityManager entityManager;

  private RegistrationLoginLinkService registrationLoginLinkService;

  @BeforeEach
  public void setup() {
    registrationLoginLinkService = new RegistrationLoginLinkService(registrationLoginLinkRepository, new UUIDSource());
  }

  @Test
  public void testCreateLoginLink() {
    final Registration registration = persistRegistration();

    final String code = registrationLoginLinkService.createLoginLink(
      registration,
      registration.getIdentity(),
      "testi@example.com"
    );

    final List<RegistrationLoginLink> loginLinks = registrationLoginLinkRepository.findAll();
    assertEquals(1, loginLinks.size());
    final RegistrationLoginLink loginLink = loginLinks.get(0);
    assertEquals(StringUtil.sha256hex(code), loginLink.getCode());
    assertEquals("testi@example.com", loginLink.getEmail());
    assertEquals(registration.getIdentity().getId(), loginLink.getIdentity().getId());
    assertEquals(registration.getId(), loginLink.getRegistration().getId());
    assertEquals(LocalDate.now().plusDays(2).atStartOfDay(), loginLink.getExpiresAt());
  }

  @Test
  public void testHasRecentLoginLink() {
    final Registration registration = persistRegistration();
    registrationLoginLinkService.createLoginLink(registration, registration.getIdentity(), "testi@example.com");

    assertTrue(registrationLoginLinkService.hasRecentLoginLink(registration, "testi@example.com"));
    assertFalse(registrationLoginLinkService.hasRecentLoginLink(registration, "muu@example.com"));
  }

  @Test
  public void testGetActiveLoginLink() {
    final Registration registration = persistRegistration();
    final String code = registrationLoginLinkService.createLoginLink(
      registration,
      registration.getIdentity(),
      "testi@example.com"
    );
    entityManager.flush();
    entityManager.clear();

    final RegistrationLoginLink loginLink = registrationLoginLinkService.getActiveLoginLink(code);

    assertEquals(registration.getIdentity().getId(), loginLink.getIdentity().getId());
    assertEquals(registration.getId(), loginLink.getRegistration().getId());
    assertEquals(registration.getExamSession().getId(), loginLink.getRegistration().getExamSession().getId());
  }

  @Test
  public void testGetActiveLoginLinkWithUnknownCodeThrows() {
    final APIException ex = assertThrows(
      APIException.class,
      () -> registrationLoginLinkService.getActiveLoginLink("unknown")
    );
    assertEquals(APIExceptionType.LOGIN_LINK_NOT_FOUND, ex.getExceptionType());
  }

  @Test
  public void testGetActiveLoginLinkWithExpiredLinkThrows() {
    final Registration registration = persistRegistration();
    final RegistrationLoginLink loginLink = new RegistrationLoginLink();
    loginLink.setCode(StringUtil.sha256hex("expired"));
    loginLink.setEmail("testi@example.com");
    loginLink.setIdentity(registration.getIdentity());
    loginLink.setRegistration(registration);
    loginLink.setExpiresAt(LocalDateTime.now().minusMinutes(1));
    entityManager.persist(loginLink);

    final APIException ex = assertThrows(
      APIException.class,
      () -> registrationLoginLinkService.getActiveLoginLink("expired")
    );
    assertEquals(APIExceptionType.LOGIN_LINK_EXPIRED, ex.getExceptionType());
  }

  private Registration persistRegistration() {
    final ExamDate examDate = entityManager.persist(Factory.examDate());
    final ExamSession examSession = entityManager.persist(Factory.examSession(examDate));

    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());
    entityManager.persist(identity);

    final Registration registration = Factory.registration(null);
    registration.setExamSession(examSession);
    registration.setIdentity(identity);

    return entityManager.persist(registration);
  }
}
