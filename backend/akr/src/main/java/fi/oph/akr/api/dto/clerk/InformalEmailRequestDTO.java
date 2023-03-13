package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.util.StringUtil;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record InformalEmailRequestDTO(
  @NonNull @NotBlank @Size(max = 255) String subject,
  @NonNull @NotBlank @Size(max = 10_000) String body,
  @NonNull @NotEmpty List<Long> translatorIds
) {
  public InformalEmailRequestDTO {
    subject = StringUtil.trim(subject);
    body = StringUtil.trim(body);
  }
}
