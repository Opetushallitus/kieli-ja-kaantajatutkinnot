package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.model.AuthorisationBasis;
import fi.oph.akr.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record AuthorisationCreateDTO(
  @NonNull @NotNull AuthorisationBasis basis,
  @Size(max = 10) @NonNull @NotBlank String from,
  @Size(max = 10) @NonNull @NotBlank String to,
  @NonNull @NotNull LocalDate termBeginDate,
  LocalDate termEndDate,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber,
  LocalDate examinationDate
)
  implements AuthorisationDTOCommonFields {
  public AuthorisationCreateDTO {
    from = StringUtil.sanitize(from);
    to = StringUtil.sanitize(to);
    diaryNumber = StringUtil.sanitize(diaryNumber);
  }
}
