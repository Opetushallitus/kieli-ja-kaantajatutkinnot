package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

import java.util.List;

@Builder
public record ClerkExamSessionDTO(
  List<ClerkRegistrationDTO> registrations
) {}
