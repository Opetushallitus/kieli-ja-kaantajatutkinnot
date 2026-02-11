package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ClerkExamSessionUpdateDTO(
  @NotNull Integer maxParticipants,
  String streetAddress,
  String zip,
  String postOffice,
  String contactInfo
) {}
