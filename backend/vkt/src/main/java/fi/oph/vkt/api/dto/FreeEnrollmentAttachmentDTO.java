package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record FreeEnrollmentAttachmentDTO(
  @NonNull @NotNull @Size(max = 255) String name,
  @NonNull @NotNull @Size(max = 255) String id,
  @NonNull @NotNull @Size(max = 255) String size
) {}
