package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicEvaluationOrderDTO;
import fi.oph.yki.api.dto.PublicEvaluationPeriodDTO;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.EvaluationOrder;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.model.type.Subtest;
import fi.oph.yki.repository.EvaluationOrderRepository;
import fi.oph.yki.repository.EvaluationRepository;
import fi.oph.yki.util.exception.NotFoundException;
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
  private EvaluationOrderRepository evaluationOrderRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicEvaluationService publicEvaluationService;

  private ExamDate examDate;

  @BeforeEach
  public void setup() {
    publicEvaluationService = new PublicEvaluationService(evaluationRepository, evaluationOrderRepository);

    examDate = Factory.examDate();
    entityManager.persist(examDate);
  }

  private Evaluation createEvaluation(final String languageCode) {
    final ExamDateLanguage examDateLanguage = Factory.examDateLanguage(examDate);
    examDateLanguage.setLanguageCode(languageCode);
    entityManager.persist(examDateLanguage);

    return Factory.evaluation(examDate, examDateLanguage);
  }

  private long persistAndDetach(final Evaluation evaluation) {
    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();

    return evaluation.getId();
  }

  private long persistAndDetach(final EvaluationOrder evaluationOrder, final Subtest... subtests) {
    entityManager.persist(evaluationOrder.getEvaluation());
    entityManager.persist(evaluationOrder);
    for (final Subtest subtest : subtests) {
      entityManager.persist(Factory.evaluationOrderSubtest(evaluationOrder, subtest));
    }
    entityManager.flush();
    entityManager.clear();

    return evaluationOrder.getId();
  }

  @Test
  public void testOngoingPeriodIsReturnedAsOpen() {
    final Evaluation evaluation = createEvaluation("fin");
    persistAndDetach(evaluation);

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

    persistAndDetach(evaluation);
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertFalse(result.get(0).open());
  }

  @Test
  public void testPeriodEndedBeforeTodayIsExcluded() {
    final Evaluation evaluation = createEvaluation("eng");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(20));
    evaluation.setEvaluationEndDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(1));

    persistAndDetach(evaluation);
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertTrue(result.isEmpty());
  }

  @Test
  public void testPeriodEndingTodayIsReturnedAndOpen() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setEvaluationEndDate(LocalDate.now(ZoneId.of("Europe/Helsinki")));

    persistAndDetach(evaluation);
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertTrue(result.get(0).open());
  }

  @Test
  public void testPeriodStartingTodayIsOpen() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")));

    persistAndDetach(evaluation);
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertEquals(1, result.size());
    assertTrue(result.get(0).open());
  }

  @Test
  public void testDeletedPeriodIsExcluded() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setDeletedAt(LocalDateTime.now(ZoneId.of("Europe/Helsinki")));

    persistAndDetach(evaluation);
    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();

    assertTrue(result.isEmpty());
  }

  @Test
  public void testReturnsEmptyListWhenNoEvaluationsExist() {
    assertTrue(publicEvaluationService.getUpcomingEvaluationPeriods().isEmpty());
  }

  @Test
  public void testOngoingPeriodIsReturnedByIdAsOpen() {
    final Evaluation evaluation = createEvaluation("fin");

    final long id = persistAndDetach(evaluation);
    final PublicEvaluationPeriodDTO period = publicEvaluationService.getEvaluationPeriod(id);

    assertEquals(id, period.id());
    assertEquals(LocalDate.of(2026, 6, 15), period.examDate());
    assertEquals("fin", period.languageCode());
    assertEquals("PERUS", period.levelCode());
    assertEquals(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(10), period.evaluationStartDate());
    assertEquals(LocalDate.now(ZoneId.of("Europe/Helsinki")).plusDays(10), period.evaluationEndDate());
    assertTrue(period.open());
  }

  @Test
  public void testPeriodEndedBeforeTodayIsStillReturnedByIdButNotOpen() {
    final Evaluation evaluation = createEvaluation("eng");
    evaluation.setEvaluationStartDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(20));
    evaluation.setEvaluationEndDate(LocalDate.now(ZoneId.of("Europe/Helsinki")).minusDays(1));

    final long id = persistAndDetach(evaluation);
    final PublicEvaluationPeriodDTO period = publicEvaluationService.getEvaluationPeriod(id);

    assertEquals(id, period.id());
    assertFalse(period.open());
  }

  @Test
  public void testDeletedPeriodIsNotFoundById() {
    final Evaluation evaluation = createEvaluation("fin");
    evaluation.setDeletedAt(LocalDateTime.now(ZoneId.of("Europe/Helsinki")));

    final long id = persistAndDetach(evaluation);

    assertThrows(NotFoundException.class, () -> publicEvaluationService.getEvaluationPeriod(id));
  }

  @Test
  public void testUnknownIdIsNotFound() {
    assertThrows(NotFoundException.class, () -> publicEvaluationService.getEvaluationPeriod(-1L));
  }

  @Test
  public void testExamDateComesFromExamDateLanguageNotEvaluation() {
    final ExamDate staleExamDate = Factory.examDate();
    staleExamDate.setExamDate(LocalDate.of(2026, 11, 30));
    entityManager.persist(staleExamDate);

    final ExamDateLanguage examDateLanguage = Factory.examDateLanguage(examDate);
    entityManager.persist(examDateLanguage);

    final long id = persistAndDetach(Factory.evaluation(staleExamDate, examDateLanguage));

    assertEquals(LocalDate.of(2026, 6, 15), publicEvaluationService.getEvaluationPeriod(id).examDate());

    final List<PublicEvaluationPeriodDTO> result = publicEvaluationService.getUpcomingEvaluationPeriods();
    assertEquals(1, result.size());
    assertEquals(LocalDate.of(2026, 6, 15), result.get(0).examDate());
  }

  @Test
  public void testOrderIsReturnedById() {
    final EvaluationOrder evaluationOrder = Factory.evaluationOrder(createEvaluation("swe"));

    final long id = persistAndDetach(evaluationOrder);
    final PublicEvaluationOrderDTO order = publicEvaluationService.getEvaluationOrder(id);

    assertEquals(id, order.id());
    assertEquals("swe", order.languageCode());
    assertEquals("PERUS", order.levelCode());
    assertEquals(LocalDate.of(2026, 6, 15), order.examDate());
  }

  @Test
  public void testDeletedOrderIsNotFoundById() {
    final EvaluationOrder evaluationOrder = Factory.evaluationOrder(createEvaluation("fin"));
    evaluationOrder.setDeletedAt(LocalDateTime.now(ZoneId.of("Europe/Helsinki")));

    final long id = persistAndDetach(evaluationOrder);

    assertThrows(NotFoundException.class, () -> publicEvaluationService.getEvaluationOrder(id));
  }

  @Test
  public void testUnknownOrderIdIsNotFound() {
    assertThrows(NotFoundException.class, () -> publicEvaluationService.getEvaluationOrder(-1L));
  }

  @Test
  public void testOrderSubtestsAreReturnedInIdOrder() {
    final EvaluationOrder evaluationOrder = Factory.evaluationOrder(createEvaluation("fin"));
    final long id = persistAndDetach(evaluationOrder, Subtest.WRITING, Subtest.READING);

    assertEquals(List.of(Subtest.WRITING, Subtest.READING), publicEvaluationService.getEvaluationOrder(id).subtests());
  }

  @Test
  public void testOrderWithoutSubtestsReturnsEmptyList() {
    final long id = persistAndDetach(Factory.evaluationOrder(createEvaluation("fin")));

    final List<Subtest> subtests = publicEvaluationService.getEvaluationOrder(id).subtests();

    assertNotNull(subtests);
    assertTrue(subtests.isEmpty());
  }
}
