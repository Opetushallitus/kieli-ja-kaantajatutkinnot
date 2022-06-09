package fi.oph.otr.api.dto.clerk;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PersonDTO(
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String nickName,
  String street,
  String postalCode,
  String town,
  String country,
  @NonNull @NotNull Boolean isIndividualised
) {}
