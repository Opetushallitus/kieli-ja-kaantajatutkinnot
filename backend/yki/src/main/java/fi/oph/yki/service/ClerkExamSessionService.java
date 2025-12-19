package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.api.dto.clerk.ClerkRegistrationDTO;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.RegistrationUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ClerkExamSessionService {

  private final ExamSessionRepository examSessionRepository;
  private final RegistrationRepository registrationRepository;

  public ClerkExamSessionDTO getExamSession(final Long examSessionId) {
    final ExamSession examSession = examSessionRepository.getReferenceById(examSessionId);
    final List<ClerkRegistrationDTO> registrationDTOs = registrationRepository
      .getByExamSession(examSession)
      .stream()
      .map(RegistrationUtil::createClerkRegistrationDTO)
      .toList();

    return ClerkExamSessionDTO.builder().registrations(registrationDTOs).build();
  }
}
