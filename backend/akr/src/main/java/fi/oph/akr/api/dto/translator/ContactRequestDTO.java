package fi.oph.akr.api.dto.translator;

import fi.oph.akr.util.StringUtil;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
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
    firstName = StringUtil.trim(firstName);
    lastName = StringUtil.trim(lastName);
    email = StringUtil.trim(email);
    phoneNumber = StringUtil.trim(phoneNumber);
    message = StringUtil.trim(message);
    fromLang = StringUtil.trim(fromLang);
    toLang = StringUtil.trim(toLang);
  }
}
