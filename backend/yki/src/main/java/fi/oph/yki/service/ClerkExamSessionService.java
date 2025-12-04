package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;

public class ClerkExamSessionService {

  public ClerkExamSessionDTO getExamSession(final Long examSessionId) {
    return ClerkExamSessionDTO.builder().build();
  }
}
