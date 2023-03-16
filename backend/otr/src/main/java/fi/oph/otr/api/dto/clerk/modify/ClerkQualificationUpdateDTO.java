package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.model.ExaminationType;
import fi.oph.otr.util.StringUtil;
import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @Size(max = 10) @NonNull @NotBlank String fromLang,
  @Size(max = 10) @NonNull @NotBlank String toLang,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull ExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber
)
  implements ClerkQualificationDTOCommonFields {
  public ClerkQualificationUpdateDTO {
    diaryNumber = StringUtil.trim(diaryNumber);
  }
}
