package fi.oph.vkt.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record KoskiEducationsDTO(
  @NonNull boolean matriculationExam,
  @NonNull boolean higherEducationConcluded,
  @NonNull boolean higherEducationEnrolled,
  @NonNull boolean eb,
  @NonNull boolean dia,
  @NonNull boolean other
) {}
