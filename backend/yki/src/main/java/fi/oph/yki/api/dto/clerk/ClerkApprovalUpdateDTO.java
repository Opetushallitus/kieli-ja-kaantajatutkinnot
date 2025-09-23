package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalUpdateDTO(@NonNull @NotNull Long id, @Size(max = 10240) String comment, Boolean approved) {}
