package fi.oph.yki.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicFreeRegistrationDTO(@NonNull @NotNull Long id) {}
