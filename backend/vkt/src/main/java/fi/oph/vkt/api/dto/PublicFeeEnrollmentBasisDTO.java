package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

import java.util.List;

@Builder
public record PublicFeeEnrollmentBasisDTO(
  @NonNull @NotNull @Size(max = 255) String type,
  @NonNull @NotNull @Size(max = 255) String source,
  List<FreeEnrollmentAttachmentDTO> attachments
)
  implements FreeEnrollmentBasisDTOCommonFields {}
