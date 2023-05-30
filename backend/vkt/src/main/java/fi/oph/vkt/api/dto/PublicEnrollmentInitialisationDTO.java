package fi.oph.vkt.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentInitialisationDTO(
  @NonNull PublicExamEventDTO examEvent,
  @NonNull PublicPersonDTO person,
  PublicReservationDTO reservation,
  PublicEnrollmentDTO enrollment
) {}
