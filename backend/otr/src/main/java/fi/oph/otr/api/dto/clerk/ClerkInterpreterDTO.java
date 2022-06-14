package fi.oph.otr.api.dto.clerk;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean deleted,
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String firstName,
  String nickName,
  @NonNull @NotBlank String email,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  String phoneNumber,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  String otherContactInfo,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull @NotNull Boolean isIndividualised,
  @NonNull @NotNull List<String> regions,
  @NonNull @NotEmpty List<ClerkQualificationDTO> qualifications
)
  implements ClerkInterpreterDTOCommonFields {}
