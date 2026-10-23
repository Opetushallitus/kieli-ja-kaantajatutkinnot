package fi.oph.yki.service;

import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.util.RegistrationUtil;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class FreeRegistrationService {

  private static final Set<String> FREE_REGISTRATION_LANGUAGES = Set.of(
    LanguageCode.fin.name(),
    LanguageCode.swe.name()
  );
  private static final int INTEGRATION_ASSISTANCE_EXAM_SESSION_LIMIT = 1;

  private final FreeRegistrationRepository freeRegistrationRepository;
  private final AuditService auditService;

  private static LevelCode allowedLevel(final FreeRegistrationSource source) {
    return switch (source) {
      case KOSKI, USER -> LevelCode.YLIN;
      case KEHA -> LevelCode.KESKI;
    };
  }

  public static boolean isFreeRegistrationAllowed(
    final Registration registration,
    final FreeRegistrationSource source
  ) {
    final ExamSession examSession = registration.getExamSession();

    return (
      registration.getState() == RegistrationState.STARTED &&
      allowedLevel(source).name().equals(examSession.getLevel()) &&
      FREE_REGISTRATION_LANGUAGES.contains(examSession.getLanguage())
    );
  }

  @Transactional(readOnly = true)
  public boolean hasIntegrationAssistanceUseLeft(final Registration registration) {
    final long usedExamSessions = freeRegistrationRepository.countExamSessionsWithFreeRegistration(
      registration.getPerson().getOid(),
      FreeRegistrationSource.KEHA,
      registration.getExamSession().getId()
    );

    return usedExamSessions < INTEGRATION_ASSISTANCE_EXAM_SESSION_LIMIT;
  }

  @Transactional
  public FreeRegistration createIntegrationAssistanceFreeRegistration(final Registration registration) {
    final FreeRegistration freeRegistration = new FreeRegistration();
    freeRegistration.setRegistration(registration);
    freeRegistration.setSource(FreeRegistrationSource.KEHA);
    freeRegistration.setType(FreeRegistrationType.IntegrationAssistance);
    freeRegistration.setMatriculationExam(false);
    freeRegistration.setHigherEducationConcluded(false);
    freeRegistration.setHigherEducationEnrolled(false);
    freeRegistration.setEb(false);
    freeRegistration.setDia(false);
    freeRegistration.setOther(false);

    final FreeRegistration saved = freeRegistrationRepository.saveAndFlush(freeRegistration);
    auditService.logCreate(
      YkiOperation.CREATE_FREE_REGISTRATION,
      saved.getId(),
      RegistrationUtil.createFreeRegistrationDTO(saved)
    );

    return saved;
  }
}
