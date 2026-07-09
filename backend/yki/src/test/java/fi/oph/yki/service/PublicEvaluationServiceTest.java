package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.repository.EvaluationRepository;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
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
public class PublicEvaluationServiceTest {

  @Resource
  private EvaluationRepository evaluationRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicEvaluationService publicEvaluationService;

  private ExamDate examDate;

  @BeforeEach
  public void setup() {
    publicEvaluationService = new PublicEvaluationService(evaluationRepository);

    examDate = Factory.examDate();
    entityManager.persist(examDate);
  }

  private Evaluation createEvaluation(final String languageCode) {
    final ExamDateLanguage examDateLanguage = Factory.examDateLanguage(examDate);
    examDateLanguage.setLanguageCode(languageCode);
    entityManager.persist(examDateLanguage);

    return Factory.evaluation(examDate, examDateLanguage);
  }

  @Test
  public void testOngoingPeriodIsReturnedAsOpen() {
    final Evaluation evaluation = createEvaluation("fin");

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    final PublicEvaluationPeriodDTO period = result.get(0);
    assertEquals(evaluation.getId(), period.id());
    assertEquals(LocalDate.of(2026, 6, 15), period.examDate());
    assertEquals("fin", period.languageCode());
    assertEquals("PERUS", period.levelCode());
    assertEquals(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(10), period.evaluationStartDate());
    assertEquals(LocalDate.now(ZoneId.of("Europe/Helsinki")).plusDays(10), period.evaluationEndDate());
    assertTrue(period.open());
  }

  @Test
  public void testPeriodStartingInFutureIsReturnedButNotOpen() {
    final Evaluation evaluation = createEvaluation("swe");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).plusDays(5));

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertFalse(result.get(0).open());
  }

  @Test
  public void testPeriodEndedBeforeTodayIsExcluded() {
    final Evaluation evaluation = createEvaluation("eng");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(20));
    evaluation.setEvaluationEndDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(1));

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertTrue(result.isEmpty());
  }

  @Test
  public void testPeriodEndingTodayIsReturnedAndOpen() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setEvaluationEndDate(LocalDate.now(ZoneId.of("Europe/Helsinki")));

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertTrue(result.get(0).open());
  }

  @Test
  public void testPeriodStartingTodayIsOpen() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")));

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertTrue(result.get(0).open());
  }

  @Test
  public void testDeletedPeriodIsExcluded() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setDeletedAt(LocalDateTime.now(ZoneId.of("Europe/Helsinki")));

    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertTrue(result.isEmpty());
  }

  @Test
  public void testReturnsEmptyListWhenNoEvaluationsExist() {
    assertTrue(publicEvaluationService.getUpcomingEvaluationPeriods().isEmpty());
  }
}
