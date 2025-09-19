package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkApprovalDTO;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.repository.FreeRegistrationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class ClerkRegistrationService {

  private final FreeRegistrationRepository freeRegistrationRepository;

  @Transactional
  public List<ClerkApprovalDTO> listApprovals() {
    final List<FreeRegistration> freeRegistrationList = freeRegistrationRepository.findApprovals();

    return freeRegistrationList.stream().map(r -> ClerkApprovalDTO.builder().build()).toList();
  }
}
