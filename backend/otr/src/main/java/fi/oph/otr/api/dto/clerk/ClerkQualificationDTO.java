package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.QualificationExaminationType;
import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean deleted,
  @NonNull @NotNull LanguagePairDTO languagePair,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull QualificationExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish
)
  implements ClerkQualificationDTOCommonFields {}
