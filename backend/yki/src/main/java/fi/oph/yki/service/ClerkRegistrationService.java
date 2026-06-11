package fi.oph.yki.service;

import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.DateUtil;
import fi.oph.yki.util.RegistrationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkRegistrationService {

  private final RegistrationRepository registrationRepository;
  private final ExamSessionRepository examSessionRepository;
  private final AuditService auditService;
  private final PersonRepository personRepository;

  @Transactional
  public void moveRegistration(final long registrationId, final long targetExamSessionId) {
    auditService.logById(YkiOperation.MOVE_REGISTRATION, registrationId);

    final Registration registration = registrationRepository.getReferenceById(registrationId);
    final ExamSession targetExamSession = examSessionRepository.getReferenceById(targetExamSessionId);
    registration.setExamSession(targetExamSession);
    registrationRepository.saveAndFlush(registration);
  }

  @Transactional
  public void cancelRegistration(final String organizerOid, final long registrationId) {
    final Registration registration = registrationRepository.getReferenceById(registrationId);

    if (!organizerOid.equals(registration.getExamSession().getOrganizer().getOid())) {
      throw new AccessDeniedException(
        String.format("Organizer (%s) has no relation to registration (%s)", organizerOid, registrationId)
      );
    }

    auditService.logById(YkiOperation.CANCEL_REGISTRATION, registrationId);

    registration.setState(RegistrationState.CANCELLED);
    registrationRepository.saveAndFlush(registration);
  }

  @Transactional
  public void cancelRegistration(final long registrationId) {
    auditService.logById(YkiOperation.CANCEL_REGISTRATION, registrationId);

    final Registration registration = registrationRepository.getReferenceById(registrationId);
    registration.setState(RegistrationState.CANCELLED);
    registrationRepository.saveAndFlush(registration);
  }
<<<<<<< HEAD

  @Transactional(readOnly = true)
  public int countFreeRegistrationsLeft(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final Person person = registration.getPerson();

    final int freeRegistrationUsed = freeRegistrationRepository.countFreeRegistrationsUsed(person.getOid());

    return NUM_FREE_REGISTRATIONS - freeRegistrationUsed;
  }

  private ClerkApprovalDTO createClerkApprovalDTO(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final ClerkRegistrationDTO clerkRegistrationDTO = createClerkRegistrationDTO(registration);
    final ClerkPersonDTO clerkPersonDTO = RegistrationUtil.createClerkPersonDTO(registration.getPerson());
    final String examDate = DateUtil.formatOptionalDate(registration.getExamSession().getExamDate().getExamDate());

    return ClerkApprovalDTO
      .builder()
      .id(freeRegistration.getId())
      .person(clerkPersonDTO)
      .examDate(examDate)
      .registration(clerkRegistrationDTO)
      .build();
  }

  private ClerkRegistrationDTO createClerkRegistrationDTO(final Registration registration) {
    return ClerkRegistrationDTO.builder().kind(registration.getKind()).build();
  }

  private ClerkApprovalDetailsDTO createClerkApprovalDetailsDTO(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final ClerkRegistrationDTO clerkRegistrationDTO = createClerkRegistrationDTO(freeRegistration.getRegistration());
    final ClerkPersonDTO clerkPersonDTO = RegistrationUtil.createClerkPersonDTO(registration.getPerson());
    final ExamSession examSession = registration.getExamSession();
    final String examDate = DateUtil.formatOptionalDate(examSession.getExamDate().getExamDate());
    final ClerkApprovalExamSessionDTO examSessionDTO = ClerkApprovalExamSessionDTO
      .builder()
      .id(examSession.getId())
      .examDate(examDate)
      .language(examSession.getLanguage())
      .level(examSession.getLevel())
      .build();

    return ClerkApprovalDetailsDTO
      .builder()
      .id(freeRegistration.getId())
      .person(clerkPersonDTO)
      .registration(clerkRegistrationDTO)
      .examSession(examSessionDTO)
      .languageOfService(RegistrationLangOfService.FI) // TODO, get from where?
      .freeRegistrationBasis(freeRegistration.getType())
      .freeRegistrationsLeft(countFreeRegistrationsLeft(freeRegistration))
      .build();
  }
=======
>>>>>>> dev
}
