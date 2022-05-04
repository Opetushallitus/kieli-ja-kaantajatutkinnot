package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkLegalInterpreterDTOCommonFields;
import fi.oph.otr.model.QualificationExaminationType;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkLegalInterpreterCreateDTO(
  @NonNull @NotNull QualificationExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @NonNull @NotEmpty @Valid List<ClerkLanguagePairDTO> languages
)
  implements ClerkLegalInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkLegalInterpreterCreateDTO {}
}
