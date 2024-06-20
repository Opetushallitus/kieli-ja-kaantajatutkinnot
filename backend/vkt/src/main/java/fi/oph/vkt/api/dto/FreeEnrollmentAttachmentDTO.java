package fi.oph.vkt.api.dto;

import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record FreeEnrollmentAttachmentDTO(
  @NonNull @NotNull @Size(max = 255) String name,
  @NonNull @NotNull @Size(max = 255) String id,
  int size
) {
  public FreeEnrollmentAttachmentDTO {
    name = StringUtil.sanitize(name);
    id = StringUtil.sanitize(id);
  }
}
