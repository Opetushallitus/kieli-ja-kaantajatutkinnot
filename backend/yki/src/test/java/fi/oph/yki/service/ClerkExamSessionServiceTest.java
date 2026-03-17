package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamSessionUpdateDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.test.context.support.WithMockUser;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@WithMockUser
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@ImportAutoConfiguration(LiquibaseAutoConfiguration.class)
public class ClerkExamSessionServiceTest {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private TestEntityManager entityManager;

  private ClerkExamSessionService clerkExamSessionService;

  @BeforeEach
  public void setup() {
    clerkExamSessionService = new ClerkExamSessionService(examSessionRepository, registrationRepository);
  }

  @Test
  public void testGetExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionDTO result = clerkExamSessionService.getExamSession(examSession.getId());

    assertEquals(examSession.getId(), result.id());
    assertEquals("fin", result.language());
    assertEquals("PERUS", result.level());
    assertEquals(20, result.maxParticipantsTotal());
    assertEquals("Testi Henkilö", result.contactName());
    assertEquals("testi@example.com", result.contactEmail());
    assertEquals("0401234567", result.contactPhoneNumber());
    assertEquals(LocalDate.of(2026, 6, 15), result.date());
    assertEquals(LocalDate.of(2026, 3, 1), result.registrationStartDate());
    assertEquals(LocalDate.of(2026, 5, 31), result.registrationEndDate());
    assertEquals(1, result.location().size());
    assertEquals("Testikatu 1", result.location().get(0).streetAddress());
    assertTrue(result.registrations().isEmpty());
  }

  @Test
  public void testUpdateExamSession() {
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final ExamSessionLocation location = Factory.examSessionLocation(examSession);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(location);
    entityManager.flush();
    entityManager.clear();

    final ClerkExamSessionUpdateDTO updateDTO = ClerkExamSessionUpdateDTO
      .builder()
      .language("deu")
      .level("KESKI")
      .maxParticipantsTotal(30)
      .streetAddress("Uusi katu 2")
      .zip("00200")
      .postOffice("Espoo")
      .contactName("Uusi Henkilö")
      .contactEmail("uusi@example.com")
      .contactPhoneNumber("0509876543")
      .build();

    final ClerkExamSessionDTO result = clerkExamSessionService.updateExamSession(examSession.getId(), updateDTO);

    assertEquals("deu", result.language());
    assertEquals("KESKI", result.level());
    assertEquals(30, result.maxParticipantsTotal());
    assertEquals("Uusi Henkilö", result.contactName());
    assertEquals("uusi@example.com", result.contactEmail());
    assertEquals("0509876543", result.contactPhoneNumber());
    assertEquals(1, result.location().size());
    assertEquals("Uusi katu 2", result.location().get(0).streetAddress());
    assertEquals("00200", result.location().get(0).zip());
    assertEquals("Espoo", result.location().get(0).postOffice());
  }
}
