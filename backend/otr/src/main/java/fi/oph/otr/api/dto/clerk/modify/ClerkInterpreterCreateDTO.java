package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkInterpreterCreateDTO(
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String nickName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String email,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  String phoneNumber,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  String otherContactInfo,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  String street,
  String postalCode,
  String town,
  String extraInformation,
  @NonNull List<String> areas,
  @NonNull @NotEmpty @Valid List<ClerkLegalInterpreterCreateDTO> legalInterpreters
)
  implements ClerkInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkInterpreterCreateDTO {}
}
