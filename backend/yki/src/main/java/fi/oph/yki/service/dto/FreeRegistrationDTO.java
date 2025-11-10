package fi.oph.yki.service.dto;

import lombok.Builder;

@Builder
public record FreeRegistrationDTO(
  long registrationId,
  String source,
  String type,
  Boolean matriculationExam,
  Boolean higherEducationConcluded,
  Boolean higherEducationEnrolled,
  Boolean eb,
  Boolean dia,
  Boolean other
) {}
