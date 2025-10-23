package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalAttachmentsDTO(@NonNull @NotBlank String url, @NonNull @NotBlank String filename) {}
