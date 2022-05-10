package fi.oph.otr.api.dto.clerk;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkInterpreterDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Long version,
  @NonNull @NotNull Boolean deleted,
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
  @NonNull @NotEmpty List<String> areas,
  @NonNull @NotEmpty List<ClerkLegalInterpreterDTO> legalInterpreters
)
  implements ClerkInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkInterpreterDTO {}
}
