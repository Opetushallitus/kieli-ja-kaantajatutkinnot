package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentBasisDTOCommonFields;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkFeeEnrollmentBasisDTO(
  @NonNull @NotNull FreeEnrollmentType type,
  @NonNull @NotNull FreeEnrollmentSource source,
  List<FreeEnrollmentAttachmentDTO> attachments,
  @Size(max = 10240) String comment,
  Boolean approved
)
  implements FreeEnrollmentBasisDTOCommonFields {
  public ClerkFeeEnrollmentBasisDTO {
    comment = StringUtil.sanitize(comment);
  }
}
