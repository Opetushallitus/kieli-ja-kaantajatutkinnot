package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailType;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class EmailRepositoryTest {

  @Resource
  private EmailRepository emailRepository;

  @Resource
  private TestEntityManager entityManager;

  @Test
  public void testFindAllByOrderByIdDescListsNewestFirst() {
    final Email older = entityManager.persist(Factory.email());
    final Email newer = Factory.email();
    newer.setEmailType(EmailType.PAYMENT);
    newer.setSubject("Maksu");
    entityManager.persist(newer);

    final List<EmailListProjection> emails = emailRepository.findAllByOrderByIdDesc(PageRequest.of(0, 2));

    assertEquals(List.of(newer.getId(), older.getId()), emails.stream().map(EmailListProjection::getId).toList());
    final EmailListProjection first = emails.getFirst();
    assertEquals(EmailType.PAYMENT, first.getEmailType());
    assertEquals("Maksu", first.getSubject());
    assertEquals("Testi Henkilö", first.getRecipientName());
    assertEquals("testi.henkilo@invalid", first.getRecipientAddress());
    assertEquals(newer.getCreatedAt(), first.getCreatedAt());
  }

  @Test
  public void testFindAllByOrderByIdDescHonoursLimit() {
    entityManager.persist(Factory.email());
    entityManager.persist(Factory.email());

    assertEquals(1, emailRepository.findAllByOrderByIdDesc(PageRequest.of(0, 1)).size());
  }
}
