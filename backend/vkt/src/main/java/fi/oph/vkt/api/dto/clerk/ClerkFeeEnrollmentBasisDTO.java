package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentBasisDTOCommonFields;
import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkFeeEnrollmentBasisDTO(
  @NonNull @NotNull @Size(max = 255) String type,
  @NonNull @NotNull @Size(max = 255) String source,
  List<FreeEnrollmentAttachmentDTO> attachments,
  @Size(max = 10240) String comment,
  Boolean approved
)
  implements FreeEnrollmentBasisDTOCommonFields {
  public ClerkFeeEnrollmentBasisDTO {
    type = StringUtil.sanitize(type);
    source = StringUtil.sanitize(source);
    comment = StringUtil.sanitize(comment);
  }
}
