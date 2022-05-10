package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.QualificationExaminationType;
import java.util.List;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkQualificationDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean deleted,
  @NonNull @NotNull QualificationExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @NonNull @NotEmpty List<ClerkLanguagePairDTO> languages
)
  implements ClerkQualificationDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkQualificationDTO {}
}
