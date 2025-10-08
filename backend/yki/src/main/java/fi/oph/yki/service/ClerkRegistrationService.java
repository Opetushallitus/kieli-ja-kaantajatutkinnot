package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkApprovalAttachmentsDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationLangOfCommunication;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.util.DateUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkRegistrationService {

  private final FreeRegistrationRepository freeRegistrationRepository;

  @Transactional(readOnly = true)
  public List<ClerkApprovalDTO> listApprovals() {
    final List<FreeRegistration> freeRegistrationList = freeRegistrationRepository.findApprovals();

    return freeRegistrationList.stream().map(this::createClerkApprovalDTO).toList();
  }

  @Transactional(readOnly = true)
  public ClerkApprovalDetailsDTO getApproval(final Long freeRegistrationId) {
    final FreeRegistration freeRegistration = freeRegistrationRepository.getReferenceById(freeRegistrationId);

    return createClerkApprovalDetailsDTO(freeRegistration);
  }

  @Transactional
  public ClerkApprovalDTO updateApproval(final ClerkApprovalUpdateDTO dto) {
    final FreeRegistration freeRegistration = freeRegistrationRepository.getReferenceById(dto.id());

    freeRegistration.setApproved(dto.approved());
    freeRegistration.setComment(dto.comment());

    freeRegistrationRepository.saveAndFlush(freeRegistration);

    return createClerkApprovalDTO(freeRegistration);
  }

  private ClerkApprovalDTO createClerkApprovalDTO(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final ClerkRegistrationDTO clerkRegistrationDTO = createClerkRegistrationDTO(registration);
    final ClerkPersonDTO clerkPersonDTO = createClerkPersonDTO(registration.getPerson());
    final String examDate = DateUtil.formatOptionalDate(registration.getExamSession().getExamDate().getExamDate());

    return ClerkApprovalDTO
      .builder()
      .id(freeRegistration.getId())
      .person(clerkPersonDTO)
      .examDate(examDate)
      .registration(clerkRegistrationDTO)
      .status(registration.getState())
      .build();
  }

  private ClerkPersonDTO createClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .oid(person.getOid())
      .fullName(person.getFirstName() + " " + person.getLastName())
      .socialSecurityNumber("-") // TODO
      .build();
  }

  private ClerkRegistrationDTO createClerkRegistrationDTO(final Registration registration) {
    return ClerkRegistrationDTO.builder().kind(registration.getKind()).build();
  }

  private ClerkApprovalDetailsDTO createClerkApprovalDetailsDTO(final FreeRegistration freeRegistration) {
    final Registration registration = freeRegistration.getRegistration();
    final ClerkRegistrationDTO clerkRegistrationDTO = createClerkRegistrationDTO(freeRegistration.getRegistration());
    final ClerkPersonDTO clerkPersonDTO = createClerkPersonDTO(registration.getPerson());
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
      .status(registration.getState())
      .languageOfCommunication(RegistrationLangOfCommunication.FI) // TODO
      .attachments(createClerkApprovalAttachmentsDTO(freeRegistration))
      .freeRegistrationBasis("MATRICULATION_EXAMINATION") // TODO
      .freeRegistrationsLeft(2) // TODO
      .comments(List.of()) // TODO
      .build();
  }

  private List<ClerkApprovalAttachmentsDTO> createClerkApprovalAttachmentsDTO(final FreeRegistration freeRegistration) {
    return freeRegistration.getAttachments().stream().map(a -> ClerkApprovalAttachmentsDTO.builder().build()).toList();
  }
}
