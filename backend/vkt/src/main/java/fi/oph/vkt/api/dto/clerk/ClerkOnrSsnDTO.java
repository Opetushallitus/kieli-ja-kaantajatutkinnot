package fi.oph.vkt.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkOnrSsnDTO(@NonNull @NotBlank String ssn, @NonNull @NotBlank String oid) {}
