package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicFeeEnrollmentBasisDTO(
  @NonNull @NotNull @Size(max = 255) String type,
  @NonNull @NotNull @Size(max = 255) String source,
  FreeEnrollmentAttachmentDTO attachments
)
  implements FreeEnrollmentBasisDTOCommonFields {}
