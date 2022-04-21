package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.NonNull;

public record ClerkInterpreterCreateDTO(
  @NonNull @NotBlank String oid,
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String nickName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  @NonNull @NotEmpty @Valid List<ClerkLegalInterpreterCreateDTO> legalInterpreters
)
  implements ClerkInterpreterDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkInterpreterCreateDTO {}
}
