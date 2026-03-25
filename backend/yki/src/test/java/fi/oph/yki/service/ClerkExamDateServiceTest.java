package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.api.dto.clerk.ClerkCreateEvaluationDTO;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkCreateExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkUpdateExamDateDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateLanguageDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import fi.oph.yki.repository.EvaluationRepository;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkExamDateServiceTest {

  @Resource
  private ExamDateRepository examDateRepository;

  @Resource
  private EvaluationRepository evaluationRepository;

  @Resource
  private ExamSessionRepository examSessionRepository;

  @Resource
  private JdbcTemplate jdbcTemplate;

  @MockitoBean
  private AuditService auditService;

  private ClerkExamDateService clerkExamDateService;

  @BeforeEach
  public void setup() {
    clerkExamDateService = new ClerkExamDateService(examDateRepository, evaluationRepository, examSessionRepository, auditService);
  }

  @Test
  public void testCreateExamDate() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.fin).levelCode(LevelCode.KESKI).build(),
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.swe).levelCode(LevelCode.PERUS).build()
        )
      )
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createExamDate(dto);

    assertNotNull(result.id());
    assertEquals(LocalDate.of(2026, 10, 15), result.examDate());
    assertEquals(LocalDate.of(2026, 8, 1), result.registrationStartDate());
    assertEquals(LocalDate.of(2026, 9, 30), result.registrationEndDate());
    assertEquals(ExamSessionType.FULL, result.examType());
    assertEquals(2, result.languages().size());
    assertEquals("fin", result.languages().get(0).languageCode());
    assertEquals("KESKI", result.languages().get(0).levelCode());
    assertEquals("swe", result.languages().get(1).languageCode());
    assertEquals("PERUS", result.languages().get(1).levelCode());
    assertNull(result.languages().get(0).evaluationStartDate());
    assertNull(result.languages().get(0).evaluationEndDate());
  }

  @Test
  public void testCreateExamDateWithNoLanguages() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 9, 1))
      .registrationEndDate(LocalDate.of(2026, 10, 31))
      .examType(ExamSessionType.READ_SPEAK)
      .languages(List.of())
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createExamDate(dto);

    assertNotNull(result.id());
    assertEquals(LocalDate.of(2026, 11, 20), result.examDate());
    assertEquals(ExamSessionType.READ_SPEAK, result.examType());
    assertEquals(0, result.languages().size());
  }

  @Test
  public void testCreateExamDateIsPersisted() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2027, 1, 10))
      .registrationStartDate(LocalDate.of(2026, 11, 1))
      .registrationEndDate(LocalDate.of(2026, 12, 31))
      .examType(ExamSessionType.LISTEN_WRITE)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.eng).levelCode(LevelCode.YLIN).build()
        )
      )
      .build();

    clerkExamDateService.createExamDate(dto);

    final List<ClerkExamDateDTO> allExamDates = clerkExamDateService.getAllExamDates();
    assertEquals(1, allExamDates.size());
    assertEquals(LocalDate.of(2027, 1, 10), allExamDates.get(0).examDate());
    assertEquals(ExamSessionType.LISTEN_WRITE, allExamDates.get(0).examType());
    assertEquals(1, allExamDates.get(0).languages().size());
    assertEquals("eng", allExamDates.get(0).languages().get(0).languageCode());
  }

  @Test
  public void testCreateExamDateThrowsForDuplicateExamDate() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    clerkExamDateService.createExamDate(dto);

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_CREATE_DUPLICATE_DATE, ex.getExceptionType());
  }

  @Test
  public void testCreateExamDateThrowsWhenRegistrationEndBeforeStart() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 9, 30))
      .registrationEndDate(LocalDate.of(2026, 8, 1))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START, ex.getExceptionType());
  }

  @Test
  public void testCreateExamDateThrowsWhenRegistrationEndEqualsStart() {
    final LocalDate sameDate = LocalDate.of(2026, 9, 15);

    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(sameDate)
      .registrationEndDate(sameDate)
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START, ex.getExceptionType());
  }

  @Test
  public void testCreateExamDateThrowsWhenExamDateBeforeRegistrationEnd() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 9, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END, ex.getExceptionType());
  }

  @Test
  public void testCreateExamDateThrowsWhenExamDateEqualsRegistrationEnd() {
    final LocalDate sameDate = LocalDate.of(2026, 9, 30);

    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(sameDate)
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(sameDate)
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END, ex.getExceptionType());
  }

  private ClerkExamDateDTO createTestExamDate() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.fin).levelCode(LevelCode.KESKI).build()
        )
      )
      .build();

    return clerkExamDateService.createExamDate(dto);
  }

  @Test
  public void testUpdateExamDate() {
    final ClerkExamDateDTO created = createTestExamDate();

    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 9, 1))
      .registrationEndDate(LocalDate.of(2026, 10, 31))
      .examType(ExamSessionType.READ_SPEAK)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.swe).levelCode(LevelCode.PERUS).build()
        )
      )
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.updateExamDate(created.id(), updateDto);

    assertEquals(created.id(), result.id());
    assertEquals(LocalDate.of(2026, 11, 20), result.examDate());
    assertEquals(LocalDate.of(2026, 9, 1), result.registrationStartDate());
    assertEquals(LocalDate.of(2026, 10, 31), result.registrationEndDate());
    assertEquals(ExamSessionType.READ_SPEAK, result.examType());
    assertEquals(1, result.languages().size());
    assertEquals("swe", result.languages().get(0).languageCode());
    assertEquals("PERUS", result.languages().get(0).levelCode());
  }

  @Test
  public void testUpdateExamDateReplacesLanguages() {
    final ClerkExamDateDTO created = createTestExamDate();
    assertEquals(1, created.languages().size());

    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(created.examDate())
      .registrationStartDate(created.registrationStartDate())
      .registrationEndDate(created.registrationEndDate())
      .examType(ExamSessionType.FULL)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.eng).levelCode(LevelCode.YLIN).build(),
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.swe).levelCode(LevelCode.PERUS).build(),
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.swe).levelCode(LevelCode.KESKI).build()
        )
      )
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.updateExamDate(created.id(), updateDto);

    assertEquals(3, result.languages().size());
    assertEquals("eng", result.languages().get(0).languageCode());
    assertEquals("YLIN", result.languages().get(0).levelCode());
    assertEquals("swe", result.languages().get(1).languageCode());
    assertEquals("PERUS", result.languages().get(1).levelCode());
    assertEquals("swe", result.languages().get(2).languageCode());
    assertEquals("KESKI", result.languages().get(2).levelCode());
  }

  @Test
  public void testUpdateExamDateIsPersisted() {
    final ClerkExamDateDTO created = createTestExamDate();

    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 12, 1))
      .registrationStartDate(LocalDate.of(2026, 10, 1))
      .registrationEndDate(LocalDate.of(2026, 11, 15))
      .examType(ExamSessionType.LISTEN_WRITE)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.fra).levelCode(LevelCode.PERUS).build()
        )
      )
      .build();

    clerkExamDateService.updateExamDate(created.id(), updateDto);

    final List<ClerkExamDateDTO> allExamDates = clerkExamDateService.getAllExamDates();
    assertEquals(1, allExamDates.size());
    assertEquals(LocalDate.of(2026, 12, 1), allExamDates.getFirst().examDate());
    assertEquals(ExamSessionType.LISTEN_WRITE, allExamDates.getFirst().examType());
    assertEquals(1, allExamDates.getFirst().languages().size());
    assertEquals("fra", allExamDates.getFirst().languages().getFirst().languageCode());
  }

  @Test
  public void testUpdateExamDateThrowsForNonExistentId() {
    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 9, 1))
      .registrationEndDate(LocalDate.of(2026, 10, 31))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.updateExamDate(999L, updateDto)
    );
    assertEquals(APIExceptionType.NOT_FOUND, ex.getExceptionType());
  }

  @Test
  public void testUpdateExamDateThrowsWhenRegistrationEndBeforeStart() {
    final ClerkExamDateDTO created = createTestExamDate();

    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 10, 31))
      .registrationEndDate(LocalDate.of(2026, 9, 1))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.updateExamDate(created.id(), updateDto)
    );
    assertEquals(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START, ex.getExceptionType());
  }

  @Test
  public void testUpdateExamDateThrowsWhenExamDateBeforeRegistrationEnd() {
    final ClerkExamDateDTO created = createTestExamDate();

    final ClerkUpdateExamDateDTO updateDto = ClerkUpdateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 9, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.updateExamDate(created.id(), updateDto)
    );
    assertEquals(APIExceptionType.EXAM_DATE_EXAM_BEFORE_REGISTRATION_END, ex.getExceptionType());
  }

  private ClerkExamDateDTO createTestExamDateWithMultipleLanguages() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(
        List.of(
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.fin).levelCode(LevelCode.KESKI).build(),
          CreateClerkExamDateLanguageDTO.builder().languageCode(LanguageCode.swe).levelCode(LevelCode.PERUS).build()
        )
      )
      .build();

    return clerkExamDateService.createExamDate(dto);
  }

  @Test
  public void testCreateEvaluation() {
    final ClerkExamDateDTO created = createTestExamDate();
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createEvaluation(created.id(), evalDto);

    assertEquals(1, result.languages().size());
    assertEquals(LocalDate.of(2026, 10, 20), result.languages().get(0).evaluationStartDate());
    assertEquals(LocalDate.of(2026, 11, 20), result.languages().get(0).evaluationEndDate());
  }

  @Test
  public void testCreateEvaluationWithOverrides() {
    final ClerkExamDateDTO created = createTestExamDateWithMultipleLanguages();
    final Long overrideLangId = created.languages().get(1).id();

    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .overrides(
        List.of(
          ClerkCreateEvaluationDTO.LanguageEvaluationOverride
            .builder()
            .examDateLanguageId(overrideLangId)
            .evaluationStartDate(LocalDate.of(2026, 10, 25))
            .evaluationEndDate(LocalDate.of(2026, 12, 1))
            .build()
        )
      )
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createEvaluation(created.id(), evalDto);

    assertEquals(2, result.languages().size());
    assertEquals(LocalDate.of(2026, 10, 20), result.languages().get(0).evaluationStartDate());
    assertEquals(LocalDate.of(2026, 11, 20), result.languages().get(0).evaluationEndDate());
    assertEquals(LocalDate.of(2026, 10, 25), result.languages().get(1).evaluationStartDate());
    assertEquals(LocalDate.of(2026, 12, 1), result.languages().get(1).evaluationEndDate());
  }

  @Test
  public void testCreateEvaluationIsPersisted() {
    final ClerkExamDateDTO created = createTestExamDate();
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .build();

    clerkExamDateService.createEvaluation(created.id(), evalDto);

    final List<ClerkExamDateDTO> allExamDates = clerkExamDateService.getAllExamDates();
    assertEquals(1, allExamDates.size());
    assertEquals(LocalDate.of(2026, 10, 20), allExamDates.get(0).languages().get(0).evaluationStartDate());
    assertEquals(LocalDate.of(2026, 11, 20), allExamDates.get(0).languages().get(0).evaluationEndDate());
  }

  @Test
  public void testCreateEvaluationThrowsForNonExistentExamDate() {
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.createEvaluation(999L, evalDto)
    );
    assertEquals(APIExceptionType.NOT_FOUND, ex.getExceptionType());
  }

  @Test
  public void testCreateEvaluationThrowsForExamDateWithNoLanguages() {
    final ClerkCreateExamDateDTO examDto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 9, 1))
      .registrationEndDate(LocalDate.of(2026, 10, 31))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();
    final ClerkExamDateDTO created = clerkExamDateService.createExamDate(examDto);

    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 11, 25))
      .evaluationEndDate(LocalDate.of(2026, 12, 25))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.createEvaluation(created.id(), evalDto)
    );
    assertEquals(APIExceptionType.EVALUATION_EXAM_DATE_HAS_NO_LANGUAGES, ex.getExceptionType());
  }

  @Test
  public void testCreateEvaluationThrowsWhenAlreadyExists() {
    final ClerkExamDateDTO created = createTestExamDate();
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 20))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .build();

    clerkExamDateService.createEvaluation(created.id(), evalDto);

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.createEvaluation(created.id(), evalDto)
    );
    assertEquals(APIExceptionType.EVALUATION_ALREADY_EXISTS, ex.getExceptionType());
  }

  @Test
  public void testCreateEvaluationThrowsWhenStartDateBeforeExamDate() {
    final ClerkExamDateDTO created = createTestExamDate();
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 10, 1))
      .evaluationEndDate(LocalDate.of(2026, 11, 20))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.createEvaluation(created.id(), evalDto)
    );
    assertEquals(APIExceptionType.EVALUATION_INVALID_DATE_ORDER, ex.getExceptionType());
  }

  @Test
  public void testCreateEvaluationThrowsWhenEndDateBeforeStartDate() {
    final ClerkExamDateDTO created = createTestExamDate();
    final ClerkCreateEvaluationDTO evalDto = ClerkCreateEvaluationDTO
      .builder()
      .evaluationStartDate(LocalDate.of(2026, 11, 20))
      .evaluationEndDate(LocalDate.of(2026, 10, 20))
      .build();

    final APIException ex = assertThrows(
      APIException.class,
      () -> clerkExamDateService.createEvaluation(created.id(), evalDto)
    );
    assertEquals(APIExceptionType.EVALUATION_INVALID_DATE_ORDER, ex.getExceptionType());
  }

  @Test
  public void testDeleteExamDate() {
    final ClerkExamDateDTO created = createTestExamDate();
    assertEquals(1, clerkExamDateService.getAllExamDates().size());

    clerkExamDateService.deleteExamDate(created.id());

    assertEquals(0, clerkExamDateService.getAllExamDates().size());
  }

  @Test
  public void testDeleteExamDateThrowsForNonExistentId() {
    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.deleteExamDate(999L));
    assertEquals(APIExceptionType.NOT_FOUND, ex.getExceptionType());
  }

  @Test
  public void testDeleteExamDateThrowsWhenExamSessionsExist() {
    final ClerkExamDateDTO created = createTestExamDate();

    jdbcTemplate.update(
      "INSERT INTO organizer (oid, agreement_start_date, agreement_end_date) VALUES (?, ?, ?)",
      "1.2.3.4.5",
      LocalDate.of(2026, 1, 1),
      LocalDate.of(2027, 1, 1)
    );
    final Long organizerId = jdbcTemplate.queryForObject(
      "SELECT id FROM organizer WHERE oid = '1.2.3.4.5'",
      Long.class
    );
    jdbcTemplate.update(
      "INSERT INTO exam_session (organizer_id, language_code, level_code, exam_date_id, max_participants) VALUES (?, ?, ?, ?, ?)",
      organizerId,
      "fin",
      "KESKI",
      created.id(),
      10
    );

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.deleteExamDate(created.id()));
    assertEquals(APIExceptionType.EXAM_DATE_HAS_SESSIONS, ex.getExceptionType());
  }

  @Test
  public void testDeletedExamDateAllowsCreatingNewWithSameDate() {
    final ClerkExamDateDTO created = createTestExamDate();
    clerkExamDateService.deleteExamDate(created.id());

    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examType(ExamSessionType.FULL)
      .languages(List.of())
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createExamDate(dto);
    assertNotNull(result.id());
    assertEquals(LocalDate.of(2026, 10, 15), result.examDate());
  }
}
