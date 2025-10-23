package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationKind;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkRegistrationDTO(@NonNull @NotNull RegistrationKind kind) {}
