package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegisterSyncDTO(
  @NonNull @NotNull RegisterPersonDTO henkilo,
  @NonNull @NotNull RegisterEnrollmentDTO suoritus
) {}
