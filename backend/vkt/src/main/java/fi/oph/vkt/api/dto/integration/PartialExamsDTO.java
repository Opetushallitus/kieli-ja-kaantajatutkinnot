package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PartialExamsDTO(
  @NonNull @NotNull String tutkintopaiva,
  GradeDTO arviointi,
  @NonNull @NotNull String tyyppi
) {}
