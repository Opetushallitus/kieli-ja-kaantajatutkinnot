package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicFreeEnrollmentBasisDTO(
  @NonNull @NotNull FreeEnrollmentType type,
  @NonNull @NotNull FreeEnrollmentSource source,
  List<FreeEnrollmentAttachmentDTO> attachments
)
  implements FreeEnrollmentBasisDTOCommonFields {}
