package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicMunicipalityDTO(@NonNull @NotNull String fi, @NonNull @NotNull String sv) {}
