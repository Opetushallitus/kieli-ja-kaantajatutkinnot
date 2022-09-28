package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.ExaminationType;
import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String fromLang,
  @NonNull @NotBlank String toLang,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull ExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  String diaryNumber
)
  implements ClerkQualificationDTOCommonFields {}
