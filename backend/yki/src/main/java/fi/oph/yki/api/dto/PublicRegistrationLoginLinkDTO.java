package fi.oph.yki.api.dto;

import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicRegistrationLoginLinkDTO(@NonNull @NotBlank @Email @Size(max = 255) String email) {
  public PublicRegistrationLoginLinkDTO {
    email = StringUtil.sanitize(email);
  }
}
