package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTOCommonFields;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterExaminationTypeDTO;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkLegalInterpreterUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Long version,
  @NonNull @NotNull ClerkLegalInterpreterExaminationTypeDTO examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @NonNull @NotEmpty @Valid List<ClerkLanguagePairDTO> languages
)
  implements ClerkLegalInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkLegalInterpreterUpdateDTO {}
}
