package fi.oph.akt.api.dto.translator;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

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
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ContactRequestDTO {}
}
