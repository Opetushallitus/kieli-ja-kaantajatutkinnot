package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.type.IdentityAuthMethod;
import fi.oph.yki.repository.IdentityRepository;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class PublicIdentityServiceTest {

  @Resource
  private IdentityRepository identityRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicIdentityService publicIdentityService;

  @BeforeEach
  public void setup() {
    publicIdentityService = new PublicIdentityService(identityRepository);
  }

  @Test
  public void testCreateIdentityHasSessionAuthMethod() {
    final Identity identity = publicIdentityService.createIdentity();
    entityManager.clear();

    assertEquals(
      IdentityAuthMethod.SESSION,
      identityRepository.findById(identity.getId()).orElseThrow().getAuthMethod()
    );
  }

  @Test
  public void testGetOrCreateIdentityFromSessionHasSessionAuthMethod() {
    final MockHttpSession session = new MockHttpSession();

    final Identity identity = publicIdentityService.getOrCreateIdentityFromSession(session);

    assertEquals(IdentityAuthMethod.SESSION, identity.getAuthMethod());
    assertEquals(identity.getId(), session.getAttribute("identityId"));
  }

  @Test
  public void testUpdateAuthMethod() {
    final Identity identity = entityManager.persist(Factory.identity());

    publicIdentityService.updateAuthMethod(identity, IdentityAuthMethod.EMAIL);
    entityManager.flush();
    entityManager.clear();

    assertEquals(IdentityAuthMethod.EMAIL, identityRepository.findById(identity.getId()).orElseThrow().getAuthMethod());
  }
}
