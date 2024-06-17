package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentBasisDTOCommonFields;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkFeeEnrollmentBasisDTO(
  @NonNull @NotNull @Size(max = 255) String type,
  @NonNull @NotNull @Size(max = 255) String source,
  FreeEnrollmentAttachmentDTO attachments,
  @Size(max = 10240) String comment,
  @NonNull @NotNull Boolean approved
)
  implements FreeEnrollmentBasisDTOCommonFields {}
