package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTOCommonFields;
import fi.oph.otr.model.QualificationExaminationType;
import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkQualificationCreateDTO(
  @NonNull @NotNull LanguagePairDTO languagePair,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate,
  @NonNull @NotNull QualificationExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish
)
  implements ClerkQualificationDTOCommonFields {}
