package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicFreeEnrollmentDetailsDTO(
  @NonNull @NotNull Long freeOralSkillLeft,
  @NonNull @NotNull Long freeTextualSkillLeft
) {}
