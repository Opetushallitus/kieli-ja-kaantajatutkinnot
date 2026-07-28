package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicEducationBasisDTO;
import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.api.dto.PublicEducationUpdateDTO;
import fi.oph.yki.api.dto.oauth2.EvaluationStateDTO;
import fi.oph.yki.api.dto.oauth2.EvaluationStateError;
import fi.oph.yki.api.dto.oauth2.EvaluationStatesDTO;
import fi.oph.yki.api.dto.oauth2.EvaluationStatesResponseDTO;
import fi.oph.yki.api.dto.oauth2.KituEvaluationState;
import fi.oph.yki.api.dto.oauth2.RegistrationIdentificationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationEvaluation;
import fi.oph.yki.model.type.EvaluationState;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationEvaluationRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.dto.FreeRegistrationDTO;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.service.koski.dto.KoulutusTyyppi;
import fi.oph.yki.util.RegistrationUtil;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class RegistrationServiceTest {

  @Resource
  private PersonRepository personRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private FreeRegistrationRepository freeRegistrationRepository;

  @Resource
  RegistrationEvaluationRepository registrationEvaluationRepository;

  @MockitoBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private KoskiService koskiService;
  private RegistrationService registrationService;

  @BeforeEach
  public void setup() {
    koskiService = mock(KoskiService.class);
    registrationService =
      new RegistrationService(
        registrationRepository,
        freeRegistrationRepository,
        personRepository,
        auditService,
        koskiService,
        registrationEvaluationRepository
      );
  }

  @Test
  public void testCreateEducations() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    final List<PublicEducationDTO> educationDTOs = List.of(
      PublicEducationDTO.builder().educationType(KoulutusTyyppi.HigherEducation.toString()).isActive(true).build()
    );
    final PublicEducationUpdateDTO publicEducationUpdateDTO = PublicEducationUpdateDTO
      .builder()
      .basis(
        PublicEducationBasisDTO
          .builder()
          .source(FreeRegistrationSource.USER)
          .educationType(FreeRegistrationType.MatriculationExam)
          .build()
      )
      .build();
    when(koskiService.getEducations(registration.getPerson().getOid())).thenReturn(educationDTOs);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(registration);

    registrationService.updateFreeRegistration(registration, publicEducationUpdateDTO);

    entityManager.refresh(registration);
    verify(auditService)
      .logCreate(
        YkiOperation.CREATE_FREE_REGISTRATION,
        registration.getId(),
        RegistrationUtil.createFreeRegistrationDTO(registration.getFreeRegistration())
      );
  }

  @Test
  public void testUpdateEducations() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
    final List<PublicEducationDTO> educationDTOs = List.of(
      PublicEducationDTO.builder().educationType(KoulutusTyyppi.HigherEducation.toString()).isActive(true).build()
    );
    final PublicEducationUpdateDTO publicEducationUpdateDTO = PublicEducationUpdateDTO
      .builder()
      .basis(
        PublicEducationBasisDTO
          .builder()
          .source(FreeRegistrationSource.USER)
          .educationType(FreeRegistrationType.MatriculationExam)
          .build()
      )
      .build();
    when(koskiService.getEducations(registration.getPerson().getOid())).thenReturn(educationDTOs);

    registration.setFreeRegistration(freeRegistration);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(person);
    entityManager.persist(registration);
    entityManager.persist(freeRegistration);

    final FreeRegistrationDTO freeRegistrationBeforeDTO = RegistrationUtil.createFreeRegistrationDTO(freeRegistration);
    registrationService.updateFreeRegistration(registration, publicEducationUpdateDTO);

    entityManager.refresh(registration);
    verify(auditService)
      .logUpdate(
        YkiOperation.UPDATE_FREE_REGISTRATION,
        registration.getId(),
        freeRegistrationBeforeDTO,
        RegistrationUtil.createFreeRegistrationDTO(registration.getFreeRegistration())
      );
  }

  private Registration persistCompletedRegistration(final Person person, final ExamDate examDate) {
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);

    entityManager.persist(examSession);
    entityManager.persist(registration);

    return registration;
  }

  private RegistrationIdentificationDTO suoritus(
    final String oid,
    final LocalDate tutkintopaiva,
    final String tutkintokieli,
    final String tutkintotaso
  ) {
    return new RegistrationIdentificationDTO(oid, tutkintopaiva, tutkintokieli, tutkintotaso, List.of());
  }

  @Test
  public void testUpsertEvaluationStatesCreatesNewEvaluation() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final Registration registration = persistCompletedRegistration(person, examDate);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    assertEquals(0, response.virheet().size());

    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == registration.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.EVALUATION_COMPLETE, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesUpdatesExistingEvaluation() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final Registration registration = persistCompletedRegistration(person, examDate);

    final RegistrationEvaluation evaluation = new RegistrationEvaluation();
    evaluation.setRegistration(registration);
    evaluation.setState(EvaluationState.EVALUATION_PENDING);
    entityManager.persist(evaluation);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    assertEquals(0, response.virheet().size());

    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == registration.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.EVALUATION_COMPLETE, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesRegistrationNotFound() {
    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus("1.2.3.4.999", LocalDate.of(2026, 6, 15), "fin", "PT"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(0, response.hyvaksytyt());
    assertEquals(1, response.virheet().size());
    assertEquals(EvaluationStateError.SUORITUSTA_EI_LOYDY, response.virheet().get(0).virhe());
  }

  @Test
  public void testUpsertEvaluationStatesInvalidExamLevel() {
    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus("1.2.3.4.5", LocalDate.of(2026, 6, 15), "fin", "XX"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(0, response.hyvaksytyt());
    assertEquals(1, response.virheet().size());
    assertEquals(EvaluationStateError.TUNTEMATON, response.virheet().get(0).virhe());
  }

  @Test
  public void testUpsertEvaluationStatesExamLevelMapping() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final ExamSession sessionKeski = Factory.examSession(examDate);
    sessionKeski.setLevel("KESKI");
    entityManager.persist(sessionKeski);

    final Registration regKeski = Factory.registration(person);
    regKeski.setExamSession(sessionKeski);
    regKeski.setState(RegistrationState.COMPLETED);
    entityManager.persist(regKeski);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "KT"),
          KituEvaluationState.TARKISTUSARVIOITAVA
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == regKeski.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.REVIEW_PENDING, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesExamLevelYlin() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final ExamSession sessionYlin = Factory.examSession(examDate);
    sessionYlin.setLevel("YLIN");
    entityManager.persist(sessionYlin);

    final Registration regYlin = Factory.registration(person);
    regYlin.setExamSession(sessionYlin);
    regYlin.setState(RegistrationState.COMPLETED);
    entityManager.persist(regYlin);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "YT"),
          KituEvaluationState.EI_SUORITUSTA
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == regYlin.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.NO_SHOW, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesMultipleEntries() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final Registration registration = persistCompletedRegistration(person, examDate);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.ARVIOITAVA
        ),
        new EvaluationStateDTO(
          suoritus("1.2.3.4.999", LocalDate.of(2026, 6, 15), "fin", "PT"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    assertEquals(1, response.virheet().size());
    assertEquals(EvaluationStateError.SUORITUSTA_EI_LOYDY, response.virheet().get(0).virhe());
  }

  @Test
  public void testUpsertEvaluationStatesKeskeytettyMapsToAborted() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final Registration registration = persistCompletedRegistration(person, examDate);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.KESKEYTETTY
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == registration.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.ABORTED, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesTarkistusarvioituMapsToReviewComplete() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();

    entityManager.persist(person);
    entityManager.persist(examDate);

    final Registration registration = persistCompletedRegistration(person, examDate);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.TARKISTUSARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.hyvaksytyt());
    final RegistrationEvaluation saved = registrationEvaluationRepository
      .findAll()
      .stream()
      .filter(e -> e.getRegistration().getId() == registration.getId())
      .findFirst()
      .orElseThrow();
    assertEquals(EvaluationState.REVIEW_COMPLETE, saved.getState());
  }

  @Test
  public void testUpsertEvaluationStatesErrorPreservesSuoritusAndTila() {
    final var suoritus = suoritus("1.2.3.4.999", LocalDate.of(2026, 1, 1), "swe", "KT");
    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(new EvaluationStateDTO(suoritus, KituEvaluationState.KESKEYTETTY))
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(1, response.virheet().size());
    final var error = response.virheet().get(0);
    assertEquals(suoritus, error.suoritus());
    assertEquals(KituEvaluationState.KESKEYTETTY, error.tila());
    assertEquals(EvaluationStateError.SUORITUSTA_EI_LOYDY, error.virhe());
  }

  @Test
  public void testUpsertEvaluationStatesNonCompletedRegistrationNotFound() {
    final Person person = Factory.person();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);

    entityManager.persist(person);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(registration);
    entityManager.flush();
    entityManager.clear();

    final EvaluationStatesDTO dto = new EvaluationStatesDTO(
      List.of(
        new EvaluationStateDTO(
          suoritus(person.getOid(), examDate.getExamDate(), "fin", "PT"),
          KituEvaluationState.ARVIOITU
        )
      )
    );

    final EvaluationStatesResponseDTO response = registrationService.upsertRegistrationEvaluationStates(dto);

    assertEquals(0, response.hyvaksytyt());
    assertEquals(1, response.virheet().size());
    assertEquals(EvaluationStateError.SUORITUSTA_EI_LOYDY, response.virheet().get(0).virhe());
  }
}
