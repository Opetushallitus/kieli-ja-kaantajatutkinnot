package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationLoginLink;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class RegistrationLoginLinkRepositoryTest {

  @Resource
  private RegistrationLoginLinkRepository registrationLoginLinkRepository;

  @Resource
  private TestEntityManager entityManager;

  @Test
  public void testFindByCode() {
    final RegistrationLoginLink loginLink = persistLoginLink("hashed-code", "testi@example.com");
    entityManager.clear();

    final RegistrationLoginLink found = registrationLoginLinkRepository.findByCode("hashed-code").orElseThrow();

    assertEquals(loginLink.getId(), found.getId());
    assertEquals(loginLink.getIdentity().getId(), found.getIdentity().getId());
    assertEquals(loginLink.getRegistration().getId(), found.getRegistration().getId());
    assertEquals(
      loginLink.getRegistration().getExamSession().getId(),
      found.getRegistration().getExamSession().getId()
    );
    assertTrue(registrationLoginLinkRepository.findByCode("other-code").isEmpty());
  }

  @Test
  public void testExistsByRegistrationIdAndEmailAndCreatedAtAfter() {
    final RegistrationLoginLink loginLink = persistLoginLink("hashed-code", "testi@example.com");
    final long registrationId = loginLink.getRegistration().getId();
    final LocalDateTime minuteAgo = LocalDateTime.now().minusMinutes(1);

    assertTrue(
      registrationLoginLinkRepository.existsByRegistrationIdAndEmailAndCreatedAtAfter(
        registrationId,
        "testi@example.com",
        minuteAgo
      )
    );
    assertFalse(
      registrationLoginLinkRepository.existsByRegistrationIdAndEmailAndCreatedAtAfter(
        registrationId,
        "muu@example.com",
        minuteAgo
      )
    );
    assertFalse(
      registrationLoginLinkRepository.existsByRegistrationIdAndEmailAndCreatedAtAfter(
        registrationId + 1,
        "testi@example.com",
        minuteAgo
      )
    );
    assertFalse(
      registrationLoginLinkRepository.existsByRegistrationIdAndEmailAndCreatedAtAfter(
        registrationId,
        "testi@example.com",
        LocalDateTime.now().plusMinutes(1)
      )
    );
  }

  private RegistrationLoginLink persistLoginLink(final String code, final String email) {
    final ExamDate examDate = entityManager.persist(Factory.examDate());
    final ExamSession examSession = entityManager.persist(Factory.examSession(examDate));

    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());
    entityManager.persist(identity);

    final Registration registration = Factory.registration(null);
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    entityManager.persist(registration);

    final RegistrationLoginLink loginLink = new RegistrationLoginLink();
    loginLink.setCode(code);
    loginLink.setEmail(email);
    loginLink.setIdentity(identity);
    loginLink.setRegistration(registration);
    loginLink.setExpiresAt(LocalDateTime.now().plusDays(1));

    return entityManager.persistAndFlush(loginLink);
  }
}
