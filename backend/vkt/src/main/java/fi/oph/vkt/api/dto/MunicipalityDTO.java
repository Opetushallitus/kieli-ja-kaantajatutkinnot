package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MunicipalityDTO(@NonNull @NotNull String code) {}
