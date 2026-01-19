package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalUpdateDTO(Boolean approved) {}
