package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.model.ExaminationType;
import fi.oph.otr.util.StringUtil;
import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationCreateDTO(
  @NonNull @NotBlank String fromLang,
  @NonNull @NotBlank String toLang,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull ExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  String diaryNumber
)
  implements ClerkQualificationDTOCommonFields {
  public ClerkQualificationCreateDTO {
    diaryNumber = StringUtil.trim(diaryNumber);
  }
}
