package fi.oph.yki.service;

import fi.oph.yki.api.dto.IntegrationAssistanceDecision;
import fi.oph.yki.api.dto.PublicIntegrationAssistanceDecisionDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.audit.dto.IntegrationAssistanceCheckAuditDTO;
import fi.oph.yki.audit.dto.IntegrationAssistanceCheckResult;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.service.keha.KehaClient;
import fi.oph.yki.service.keha.KehaDecision;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class IntegrationAssistanceService {

  private static final Logger LOG = LoggerFactory.getLogger(IntegrationAssistanceService.class);

  private final FreeRegistrationService freeRegistrationService;
  private final FreeRegistrationRepository freeRegistrationRepository;
  private final PersonRepository personRepository;
  private final OnrService onrService;
  private final KehaClient kehaClient;
  private final AuditService auditService;

  @Value("${app.keha.enabled}")
  private boolean enabled;

  private static PublicIntegrationAssistanceDecisionDTO decision(final IntegrationAssistanceDecision decision) {
    return PublicIntegrationAssistanceDecisionDTO.builder().decision(decision).build();
  }

  private static PublicIntegrationAssistanceDecisionDTO free(final FreeRegistration freeRegistration) {
    return PublicIntegrationAssistanceDecisionDTO
      .builder()
      .decision(IntegrationAssistanceDecision.FREE)
      .freeRegistrationId(freeRegistration.getId())
      .build();
  }

  private static IntegrationAssistanceCheckAuditDTO checkResult(
    final UUID personUuid,
    final IntegrationAssistanceCheckResult result
  ) {
    return IntegrationAssistanceCheckAuditDTO.builder().personUuid(personUuid.toString()).result(result).build();
  }

  private static IntegrationAssistanceCheckAuditDTO checkError(final UUID personUuid, final String errorDetail) {
    return IntegrationAssistanceCheckAuditDTO
      .builder()
      .personUuid(personUuid.toString())
      .result(IntegrationAssistanceCheckResult.ERROR)
      .errorDetail(errorDetail)
      .build();
  }

  private static String errorDetail(final String stage, final Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    }
    return stage + ": " + e.getClass().getSimpleName();
  }

  @Transactional
  public PublicIntegrationAssistanceDecisionDTO decide(final Registration registration) {
    if (!FreeRegistrationService.isFreeRegistrationAllowed(registration, FreeRegistrationSource.KEHA)) {
      LOG.warn(
        "Integration assistance free registration not allowed. registrationId: {}, state: {}, level: {}, language: {}",
        registration.getId(),
        registration.getState(),
        registration.getExamSession().getLevel(),
        registration.getExamSession().getLanguage()
      );
      throw new APIException(APIExceptionType.FREE_REGISTRATION_NOT_ALLOWED);
    }

    if (!enabled) {
      return decision(IntegrationAssistanceDecision.UNAVAILABLE);
    }

    final String personOid = registration.getPerson().getOid();
    // Serialises concurrent decisions for the same person so that the single use can't be reserved twice.
    final Person person = personRepository.findByOidForUpdate(personOid).orElseThrow();

    final Optional<FreeRegistration> existing = freeRegistrationRepository.findByRegistration(registration);
    if (existing.isPresent()) {
      if (existing.get().getSource() == FreeRegistrationSource.KEHA) {
        return free(existing.get());
      }
      LOG.warn(
        "Registration {} already has a free registration from source {}",
        registration.getId(),
        existing.get().getSource()
      );
      throw new APIException(APIExceptionType.FREE_REGISTRATION_NOT_ALLOWED);
    }

    if (!freeRegistrationService.hasIntegrationAssistanceUseLeft(registration)) {
      return decision(IntegrationAssistanceDecision.ALREADY_USED);
    }

    final IntegrationAssistanceCheckAuditDTO check = checkEligibility(personOid, getOrCreateUuid(person));
    auditService.logCreate(YkiOperation.CHECK_INTEGRATION_ASSISTANCE, registration.getId(), check);

    return switch (check.result()) {
      case ELIGIBLE -> free(freeRegistrationService.createIntegrationAssistanceFreeRegistration(registration));
      case NOT_ELIGIBLE -> decision(IntegrationAssistanceDecision.NOT_ELIGIBLE);
      case ERROR -> decision(IntegrationAssistanceDecision.UNAVAILABLE);
    };
  }

  private UUID getOrCreateUuid(final Person person) {
    if (person.getUuid() == null) {
      person.setUuid(UUID.randomUUID());
      personRepository.saveAndFlush(person);
    }
    return person.getUuid();
  }

  private IntegrationAssistanceCheckAuditDTO checkEligibility(final String personOid, final UUID personUuid) {
    final String ssn;
    try {
      ssn = onrService.getPersonalData(personOid).getIdentityNumber();
    } catch (final Exception e) {
      LOG.error("ONR lookup failed for integration assistance check, personUuid: {}", personUuid, e);
      return checkError(personUuid, errorDetail("ONR", e));
    }

    if (ssn == null || ssn.isBlank()) {
      LOG.error("No identity number in ONR for integration assistance check, personUuid: {}", personUuid);
      return checkError(personUuid, "ONR: identity number missing");
    }

    try {
      return checkResult(
        personUuid,
        kehaClient.checkEligibility(ssn, personUuid) == KehaDecision.ELIGIBLE
          ? IntegrationAssistanceCheckResult.ELIGIBLE
          : IntegrationAssistanceCheckResult.NOT_ELIGIBLE
      );
    } catch (final Exception e) {
      LOG.error("KEHA eligibility check failed, personUuid: {}", personUuid, e);
      return checkError(personUuid, errorDetail("KEHA", e));
    }
  }
}
