package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationLangOfService;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.DateUtil;
import fi.oph.yki.util.RegistrationUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkRegistrationService {

  public static final int NUM_FREE_REGISTRATIONS = 3;
  private final FreeRegistrationRepository freeRegistrationRepository;
  private final RegistrationRepository registrationRepository;
  private final ExamSessionRepository examSessionRepository;
  private final AuditService auditService;
  private final PersonRepository personRepository;

  @Transactional(readOnly = true)
  public List<ClerkApprovalDTO> listApprovals() {
    auditService.logOperation(YkiOperation.LIST_APPROVALS);

    final List<FreeRegistration> freeRegistrationList = freeRegistrationRepository.findApprovals();

    return freeRegistrationList.stream().map(this::createClerkApprovalDTO).toList();
  }

  @Transactional(readOnly = true)
  public ClerkApprovalDetailsDTO getApproval(final Long freeRegistrationId) {
    auditService.logById(YkiOperation.GET_APPROVAL, freeRegistrationId);

    final FreeRegistration freeRegistration = freeRegistrationRepository.getReferenceById(freeRegistrationId);

    return createClerkApprovalDetailsDTO(freeRegistration);
  }

  @Transactional
  public ClerkApprovalDetailsDTO updateApproval(final Long freeRegistrationId, final ClerkApprovalUpdateDTO dto) {
    auditService.logById(YkiOperation.UPDATE_APPROVAL, freeRegistrationId);

    final Boolean approved = dto.approved();
    final FreeRegistration freeRegistration = freeRegistrationRepository.getReferenceById(freeRegistrationId);

    if (approved) {
      freeRegistration.getRegistration().setState(RegistrationState.COMPLETED);
    } else {
      freeRegistration.getRegistration().setState(RegistrationState.SUBMITTED);
    }

    final FreeRegistration freeRegistrationUpdated = freeRegistrationRepository.saveAndFlush(freeRegistration);

    return createClerkApprovalDetailsDTO(freeRegistrationUpdated);
  }

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
}
