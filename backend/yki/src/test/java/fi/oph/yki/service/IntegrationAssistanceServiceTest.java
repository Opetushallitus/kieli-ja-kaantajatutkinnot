package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.IntegrationAssistanceDecision;
import fi.oph.yki.api.dto.PublicIntegrationAssistanceDecisionDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.audit.dto.IntegrationAssistanceCheckAuditDTO;
import fi.oph.yki.audit.dto.IntegrationAssistanceCheckResult;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.service.keha.KehaClient;
import fi.oph.yki.service.keha.KehaDecision;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class IntegrationAssistanceServiceTest {

  private static final String SSN = "010170-999R";

  @Resource
  private FreeRegistrationRepository freeRegistrationRepository;

  @Resource
  private PersonRepository personRepository;

  @MockitoBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private OnrService onrService;
  private KehaClient kehaClient;
  private IntegrationAssistanceService integrationAssistanceService;

  private Person person;
  private ExamDate examDate;

  @BeforeEach
  public void setup() throws Exception {
    onrService = mock(OnrService.class);
    kehaClient = mock(KehaClient.class);
    integrationAssistanceService =
      new IntegrationAssistanceService(
        new FreeRegistrationService(freeRegistrationRepository, auditService),
        freeRegistrationRepository,
        personRepository,
        onrService,
        kehaClient,
        auditService
      );
    ReflectionTestUtils.setField(integrationAssistanceService, "enabled", true);

    person = Factory.person();
    examDate = Factory.examDate();
    entityManager.persist(person);
    entityManager.persist(examDate);

    final PersonalDataDTO personalData = new PersonalDataDTO();
    personalData.setOidHenkilo(person.getOid());
    personalData.setIdentityNumber(SSN);
    when(onrService.getPersonalData(person.getOid())).thenReturn(personalData);
  }

  @Test
  public void testEligibleCreatesFreeRegistration() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.ELIGIBLE);

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.FREE, result.decision());
    final FreeRegistration freeRegistration = freeRegistrationRepository.findByRegistration(registration).orElseThrow();
    assertEquals(freeRegistration.getId(), result.freeRegistrationId());
    assertEquals(FreeRegistrationSource.KEHA, freeRegistration.getSource());
    assertEquals(FreeRegistrationType.IntegrationAssistance, freeRegistration.getType());
    verify(auditService).logCreate(eq(YkiOperation.CREATE_FREE_REGISTRATION), eq(freeRegistration.getId()), any());

    final ArgumentCaptor<UUID> personUuid = ArgumentCaptor.forClass(UUID.class);
    verify(kehaClient).checkEligibility(eq(SSN), personUuid.capture());
    final IntegrationAssistanceCheckAuditDTO check = auditedCheck(registration);
    assertEquals(IntegrationAssistanceCheckResult.ELIGIBLE, check.result());
    assertEquals(personUuid.getValue().toString(), check.personUuid());
    assertNull(check.errorDetail());

    entityManager.flush();
    entityManager.clear();
    assertEquals(personUuid.getValue(), personRepository.getByOid(person.getOid()).getUuid());
  }

  @Test
  public void testExistingPersonUuidIsReused() {
    final UUID existingUuid = UUID.randomUUID();
    person.setUuid(existingUuid);
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.NOT_ELIGIBLE);

    integrationAssistanceService.decide(registration);

    verify(kehaClient).checkEligibility(SSN, existingUuid);
    assertEquals(existingUuid.toString(), auditedCheck(registration).personUuid());
    assertEquals(existingUuid, person.getUuid());
  }

  @Test
  public void testPersonUuidCreatedOnceAcrossChecks() {
    final Registration first = persistRegistration(persistExamSession("KESKI", "fin"), RegistrationState.STARTED);
    final Registration second = persistRegistration(persistExamSession("KESKI", "swe"), RegistrationState.STARTED);
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.NOT_ELIGIBLE);

    integrationAssistanceService.decide(first);
    final UUID createdUuid = person.getUuid();
    integrationAssistanceService.decide(second);

    assertNotNull(createdUuid);
    assertEquals(createdUuid, person.getUuid());
    verify(kehaClient, times(2)).checkEligibility(SSN, createdUuid);
  }

  @Test
  public void testEligibleForSwedish() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "swe"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.ELIGIBLE);

    assertEquals(IntegrationAssistanceDecision.FREE, integrationAssistanceService.decide(registration).decision());
  }

  @Test
  public void testNotEligible() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.NOT_ELIGIBLE);

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.NOT_ELIGIBLE, result.decision());
    assertNull(result.freeRegistrationId());
    assertTrue(freeRegistrationRepository.findByRegistration(registration).isEmpty());
    assertEquals(IntegrationAssistanceCheckResult.NOT_ELIGIBLE, auditedCheck(registration).result());
    verify(auditService, never()).logCreate(eq(YkiOperation.CREATE_FREE_REGISTRATION), anyLong(), any());
  }

  @Test
  public void testKehaFailureIsUnavailable() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenThrow(new IllegalStateException("boom"));

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.UNAVAILABLE, result.decision());
    assertTrue(freeRegistrationRepository.findByRegistration(registration).isEmpty());
    final IntegrationAssistanceCheckAuditDTO check = auditedCheck(registration);
    assertEquals(IntegrationAssistanceCheckResult.ERROR, check.result());
    assertEquals("KEHA: IllegalStateException", check.errorDetail());
  }

  @Test
  public void testOnrFailureIsUnavailable() throws Exception {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(onrService.getPersonalData(person.getOid()))
      .thenThrow(new RuntimeException("Unexpected status code from ONR"));

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.UNAVAILABLE, result.decision());
    final IntegrationAssistanceCheckAuditDTO check = auditedCheck(registration);
    assertEquals(IntegrationAssistanceCheckResult.ERROR, check.result());
    assertEquals("ONR: RuntimeException", check.errorDetail());
    verifyNoInteractions(kehaClient);
  }

  @Test
  public void testMissingIdentityNumberIsUnavailable() throws Exception {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    final PersonalDataDTO personalData = new PersonalDataDTO();
    personalData.setOidHenkilo(person.getOid());
    when(onrService.getPersonalData(person.getOid())).thenReturn(personalData);

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.UNAVAILABLE, result.decision());
    assertEquals("ONR: identity number missing", auditedCheck(registration).errorDetail());
    verifyNoInteractions(kehaClient);
  }

  @Test
  public void testRepeatedCallReturnsExistingFreeRegistration() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    final FreeRegistration existing = persistKehaFreeRegistration(registration);

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.FREE, result.decision());
    assertEquals(existing.getId(), result.freeRegistrationId());
    verifyNoInteractions(kehaClient, auditService);
  }

  @Test
  public void testUsedInOtherCompletedExamSession() {
    assertAlreadyUsedByOtherExamSession(RegistrationState.COMPLETED, RegistrationKind.ADMISSION);
  }

  @Test
  public void testReservedByOtherStartedExamSession() {
    assertAlreadyUsedByOtherExamSession(RegistrationState.STARTED, RegistrationKind.ADMISSION);
  }

  @Test
  public void testReservedByOtherQueuedExamSession() {
    assertAlreadyUsedByOtherExamSession(RegistrationState.SUBMITTED, RegistrationKind.QUEUE);
  }

  @Test
  public void testCancelledOtherExamSessionDoesNotCount() {
    assertOtherExamSessionDoesNotCount(RegistrationState.PAID_AND_CANCELLED, FreeRegistrationSource.KEHA);
  }

  @Test
  public void testExpiredOtherExamSessionDoesNotCount() {
    assertOtherExamSessionDoesNotCount(RegistrationState.EXPIRED, FreeRegistrationSource.KEHA);
  }

  @Test
  public void testKoskiFreeRegistrationInOtherExamSessionDoesNotCount() {
    assertOtherExamSessionDoesNotCount(RegistrationState.COMPLETED, FreeRegistrationSource.KOSKI);
  }

  @Test
  public void testOtherPartialExamInSameExamSessionDoesNotConsumeUse() {
    final ExamSession examSession = persistExamSession("KESKI", "fin");
    final Registration readRegistration = persistRegistration(examSession, RegistrationState.COMPLETED);
    readRegistration.setPartialExamType(PartialExamType.READ);
    persistKehaFreeRegistration(readRegistration);
    final Registration speakRegistration = persistRegistration(examSession, RegistrationState.STARTED);
    speakRegistration.setPartialExamType(PartialExamType.SPEAK);
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.ELIGIBLE);

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(speakRegistration);

    assertEquals(IntegrationAssistanceDecision.FREE, result.decision());
    assertNotNull(result.freeRegistrationId());
  }

  @Test
  public void testNotAllowedForAdvancedLevel() {
    assertNotAllowed(persistRegistration(persistExamSession("YLIN", "fin"), RegistrationState.STARTED));
  }

  @Test
  public void testNotAllowedForBasicLevel() {
    assertNotAllowed(persistRegistration(persistExamSession("PERUS", "fin"), RegistrationState.STARTED));
  }

  @Test
  public void testNotAllowedForEnglish() {
    assertNotAllowed(persistRegistration(persistExamSession("KESKI", "eng"), RegistrationState.STARTED));
  }

  @Test
  public void testNotAllowedForSubmittedRegistration() {
    assertNotAllowed(persistRegistration(persistExamSession("KESKI", "fin"), RegistrationState.SUBMITTED));
  }

  @Test
  public void testNotAllowedWhenRegistrationHasOtherFreeRegistrationSource() {
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    entityManager.persist(Factory.freeRegistration(registration));

    assertNotAllowed(registration);
  }

  @Test
  public void testDisabledIsUnavailable() {
    ReflectionTestUtils.setField(integrationAssistanceService, "enabled", false);
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.UNAVAILABLE, result.decision());
    assertNull(person.getUuid());
    verifyNoInteractions(onrService, kehaClient, auditService);
  }

  private void assertAlreadyUsedByOtherExamSession(final RegistrationState state, final RegistrationKind kind) {
    final Registration other = persistRegistration(persistExamSession("KESKI", "swe"), state);
    other.setKind(kind);
    persistKehaFreeRegistration(other);
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );

    final PublicIntegrationAssistanceDecisionDTO result = integrationAssistanceService.decide(registration);

    assertEquals(IntegrationAssistanceDecision.ALREADY_USED, result.decision());
    assertTrue(freeRegistrationRepository.findByRegistration(registration).isEmpty());
    verify(auditService, never()).logCreate(eq(YkiOperation.CHECK_INTEGRATION_ASSISTANCE), anyLong(), any());
    assertNull(person.getUuid());
    verifyNoInteractions(kehaClient);
  }

  private void assertOtherExamSessionDoesNotCount(final RegistrationState state, final FreeRegistrationSource source) {
    final Registration other = persistRegistration(persistExamSession("KESKI", "swe"), state);
    final FreeRegistration otherFreeRegistration = Factory.freeRegistration(other);
    otherFreeRegistration.setSource(source);
    entityManager.persist(otherFreeRegistration);
    final Registration registration = persistRegistration(
      persistExamSession("KESKI", "fin"),
      RegistrationState.STARTED
    );
    when(kehaClient.checkEligibility(eq(SSN), any(UUID.class))).thenReturn(KehaDecision.ELIGIBLE);

    assertEquals(IntegrationAssistanceDecision.FREE, integrationAssistanceService.decide(registration).decision());
  }

  private void assertNotAllowed(final Registration registration) {
    final APIException exception = assertThrows(
      APIException.class,
      () -> integrationAssistanceService.decide(registration)
    );

    assertEquals(APIExceptionType.FREE_REGISTRATION_NOT_ALLOWED, exception.getExceptionType());
    assertNull(person.getUuid());
    verifyNoInteractions(onrService, kehaClient, auditService);
  }

  private IntegrationAssistanceCheckAuditDTO auditedCheck(final Registration registration) {
    final ArgumentCaptor<IntegrationAssistanceCheckAuditDTO> check = ArgumentCaptor.forClass(
      IntegrationAssistanceCheckAuditDTO.class
    );
    verify(auditService)
      .logCreate(eq(YkiOperation.CHECK_INTEGRATION_ASSISTANCE), eq(registration.getId()), check.capture());
    return check.getValue();
  }

  private ExamSession persistExamSession(final String level, final String language) {
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setLevel(level);
    examSession.setLanguage(language);
    entityManager.persist(examSession);

    return examSession;
  }

  private Registration persistRegistration(final ExamSession examSession, final RegistrationState state) {
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(state);
    entityManager.persist(registration);

    return registration;
  }

  private FreeRegistration persistKehaFreeRegistration(final Registration registration) {
    final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
    freeRegistration.setSource(FreeRegistrationSource.KEHA);
    freeRegistration.setType(FreeRegistrationType.IntegrationAssistance);
    freeRegistration.setMatriculationExam(false);
    entityManager.persist(freeRegistration);

    return freeRegistration;
  }
}
