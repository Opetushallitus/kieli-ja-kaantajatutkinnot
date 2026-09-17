package fi.oph.yki.service;

import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
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
  private final RegistrationEmailService registrationEmailService;

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

    cancelRegistration(registrationId);
  }

  @Transactional
  public void cancelRegistration(final long registrationId) {
    auditService.logById(YkiOperation.CANCEL_REGISTRATION, registrationId);

    final Registration registration = registrationRepository.getReferenceById(registrationId);
    final RegistrationState previousState = registration.getState();
    final RegistrationState newState = previousState == RegistrationState.COMPLETED
      ? RegistrationState.PAID_AND_CANCELLED
      : RegistrationState.CANCELLED;

    registration.setState(newState);
    registrationRepository.saveAndFlush(registration);

    if (newState == RegistrationState.PAID_AND_CANCELLED) {
      registrationEmailService.sendCancelRegistrationEmail(registration);
    }
  }
}
