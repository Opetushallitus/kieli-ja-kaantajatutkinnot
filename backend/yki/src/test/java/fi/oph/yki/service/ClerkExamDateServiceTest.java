package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import fi.oph.yki.api.dto.clerk.ClerkCreateExamDateDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.api.dto.clerk.CreateClerkExamDateLanguageDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
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
public class ClerkExamDateServiceTest {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

  @Resource
  private ExamDateRepository examDateRepository;

  @MockBean
  private AuditService auditService;

  private ClerkExamDateService clerkExamDateService;

  @BeforeEach
  public void setup() {
    clerkExamDateService = new ClerkExamDateService(examDateRepository, auditService);
  }

  @Test
  public void testCreateExamDate() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 10, 15))
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .examTypes(List.of(ExamSessionType.FULL))
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
    assertEquals(List.of(ExamSessionType.FULL), result.examTypes());
    assertEquals(2, result.languages().size());
    assertEquals("fin", result.languages().get(0).languageCode());
    assertEquals("KESKI", result.languages().get(0).levelCode());
    assertEquals("swe", result.languages().get(1).languageCode());
    assertEquals("PERUS", result.languages().get(1).levelCode());
  }

  @Test
  public void testCreateExamDateWithNoLanguages() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2026, 11, 20))
      .registrationStartDate(LocalDate.of(2026, 9, 1))
      .registrationEndDate(LocalDate.of(2026, 10, 31))
      .examTypes(List.of(ExamSessionType.READ_SPEAK))
      .languages(List.of())
      .build();

    final ClerkExamDateDTO result = clerkExamDateService.createExamDate(dto);

    assertNotNull(result.id());
    assertEquals(LocalDate.of(2026, 11, 20), result.examDate());
    assertEquals(List.of(ExamSessionType.READ_SPEAK), result.examTypes());
    assertEquals(0, result.languages().size());
  }

  @Test
  public void testCreateExamDateIsPersisted() {
    final ClerkCreateExamDateDTO dto = ClerkCreateExamDateDTO
      .builder()
      .examDate(LocalDate.of(2027, 1, 10))
      .registrationStartDate(LocalDate.of(2026, 11, 1))
      .registrationEndDate(LocalDate.of(2026, 12, 31))
      .examTypes(List.of(ExamSessionType.LISTEN_WRITE))
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
    assertEquals(List.of(ExamSessionType.LISTEN_WRITE), allExamDates.get(0).examTypes());
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
      .examTypes(List.of(ExamSessionType.FULL))
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
      .examTypes(List.of(ExamSessionType.FULL))
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
      .examTypes(List.of(ExamSessionType.FULL))
      .languages(List.of())
      .build();

    final APIException ex = assertThrows(APIException.class, () -> clerkExamDateService.createExamDate(dto));
    assertEquals(APIExceptionType.EXAM_DATE_REGISTRATION_END_BEFORE_START, ex.getExceptionType());
  }
}
