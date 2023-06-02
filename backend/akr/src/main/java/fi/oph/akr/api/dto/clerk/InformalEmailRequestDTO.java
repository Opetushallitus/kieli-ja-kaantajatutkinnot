package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record InformalEmailRequestDTO(
  @NonNull @NotBlank @Size(max = 255) String subject,
  @NonNull @NotBlank @Size(max = 10_000) String body,
  @NonNull @NotEmpty List<Long> translatorIds
) {
  public InformalEmailRequestDTO {
    subject = StringUtil.sanitize(subject);
    body = StringUtil.sanitize(body);
  }
}
