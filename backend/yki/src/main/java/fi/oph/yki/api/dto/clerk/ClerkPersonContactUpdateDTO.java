package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ClerkPersonContactUpdateDTO(
  @NotBlank @Size(max = 255) String email,
  @NotBlank @Size(max = 255) String phoneNumber,
  @NotBlank @Size(max = 100) String streetAddress,
  @NotBlank @Size(max = 50) String postOffice,
  @NotBlank @Size(max = 255) String zip
) {
  public ClerkPersonContactUpdateDTO {
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    streetAddress = StringUtil.sanitize(streetAddress);
    postOffice = StringUtil.sanitize(postOffice);
    zip = StringUtil.sanitize(zip);
  }
}
