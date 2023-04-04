package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.model.ExaminationType;
import fi.oph.otr.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationCreateDTO(
  @Size(max = 10) @NonNull @NotBlank String fromLang,
  @Size(max = 10) @NonNull @NotBlank String toLang,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull ExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber
)
  implements ClerkQualificationDTOCommonFields {
  public ClerkQualificationCreateDTO {
    diaryNumber = StringUtil.trim(diaryNumber);
  }
}
