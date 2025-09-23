package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.api.dto.clerk.ClerkApprovalUpdateDTO;
import fi.oph.yki.api.dto.clerk.ClerkPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.FreeRegistrationRepository;
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

  @Transactional
  public ClerkApprovalDTO updateApproval(final ClerkApprovalUpdateDTO dto) {
    final FreeRegistration freeRegistration = freeRegistrationRepository.getReferenceById(dto.id());

    freeRegistration.setApproved(dto.approved());
    freeRegistration.setComment(dto.comment());

    freeRegistrationRepository.saveAndFlush(freeRegistration);

    return createClerkApprovalDTO(freeRegistration);
  }

  private ClerkApprovalDTO createClerkApprovalDTO(final FreeRegistration freeRegistration) {
    final ClerkRegistrationDTO clerkRegistrationDTO = createClerkRegistrationDTO(freeRegistration.getRegistration());
    final ClerkPersonDTO clerkPersonDTO = ClerkPersonDTO.builder().build();

    return ClerkApprovalDTO.builder().clerkPersonDTO(clerkPersonDTO).clerkRegistrationDTO(clerkRegistrationDTO).build();
  }

  private ClerkRegistrationDTO createClerkRegistrationDTO(final Registration registration) {
    return ClerkRegistrationDTO.builder().build();
  }
}
