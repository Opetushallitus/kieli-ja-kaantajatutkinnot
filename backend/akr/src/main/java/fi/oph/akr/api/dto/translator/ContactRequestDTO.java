package fi.oph.akr.api.dto.translator;

import fi.oph.akr.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ContactRequestDTO(
  @NonNull @NotBlank @Size(max = 255) String firstName,
  @NonNull @NotBlank @Size(max = 255) String lastName,
  @NonNull @NotBlank @Size(max = 255) String email,
  @Size(max = 255) String phoneNumber,
  @NonNull @NotBlank @Size(max = 6000) String message,
  @NonNull @NotBlank @Size(max = 10) String fromLang,
  @NonNull @NotBlank @Size(max = 10) String toLang,
  @NonNull @NotEmpty List<Long> translatorIds
) {
  public ContactRequestDTO {
    firstName = StringUtil.sanitize(firstName);
    lastName = StringUtil.sanitize(lastName);
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    message = StringUtil.sanitize(message);
    fromLang = StringUtil.sanitize(fromLang);
    toLang = StringUtil.sanitize(toLang);
  }
}
