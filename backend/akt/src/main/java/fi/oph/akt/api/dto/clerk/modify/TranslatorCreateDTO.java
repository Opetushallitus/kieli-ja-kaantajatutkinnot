package fi.oph.akt.api.dto.clerk.modify;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record TranslatorCreateDTO(
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  String identityNumber,
  String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull @NotNull Boolean isAssuranceGiven,
  @NonNull @NotEmpty List<AuthorisationCreateDTO> authorisations
)
  implements TranslatorDTOCommonFields {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public TranslatorCreateDTO {}
}
