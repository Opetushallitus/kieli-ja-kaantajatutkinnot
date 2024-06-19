package fi.oph.vkt.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicFreeEnrollmentBasisDTO(
  @NonNull @NotNull @Size(max = 255) String type,
  @NonNull @NotNull @Size(max = 255) String source,
  List<FreeEnrollmentAttachmentDTO> attachments
)
  implements FreeEnrollmentBasisDTOCommonFields {}
