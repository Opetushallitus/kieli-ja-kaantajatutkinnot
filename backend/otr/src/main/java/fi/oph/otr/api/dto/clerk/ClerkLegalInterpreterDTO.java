package fi.oph.otr.api.dto.clerk;

import java.util.List;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkLegalInterpreterDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Long version,
  @NonNull @NotNull Boolean deleted,
  @NonNull @NotNull ClerkLegalInterpreterExaminationTypeDTO examinationType,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  @NonNull @NotNull Boolean permissionToPublish,
  String otherContactInfo,
  String extraInformation,
  @NonNull @NotEmpty List<String> areas,
  @NonNull @NotEmpty List<ClerkLanguagePairDTO> languages
)
  implements ClerkLegalInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkLegalInterpreterDTO {}
}
