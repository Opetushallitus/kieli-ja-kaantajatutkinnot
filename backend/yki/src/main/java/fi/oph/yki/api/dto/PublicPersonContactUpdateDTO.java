package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicPersonContactUpdateDTO(
  @NotBlank @Email @Size(max = 255) String email,
  @NotBlank @Size(max = 255) String phoneNumber,
  @NotBlank @Size(max = 100) String streetAddress,
  @NotBlank @Size(max = 50) String postOffice,
  @NotBlank @Size(max = 255) String zip,
  @Size(max = 3) String countryCode
) {
  public PublicPersonContactUpdateDTO {
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    streetAddress = StringUtil.sanitize(streetAddress);
    postOffice = StringUtil.sanitize(postOffice);
    zip = StringUtil.sanitize(zip);
    countryCode = StringUtil.sanitize(countryCode);
  }
}
