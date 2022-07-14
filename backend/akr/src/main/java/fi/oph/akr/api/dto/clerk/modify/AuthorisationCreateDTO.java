package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record AuthorisationCreateDTO(
  @NonNull @NotNull AuthorisationBasis basis,
  @NonNull @NotBlank String from,
  @NonNull @NotBlank String to,
  @NonNull @NotNull LocalDate termBeginDate,
  LocalDate termEndDate,
  @NonNull @NotNull Boolean permissionToPublish,
  String diaryNumber,
  LocalDate examinationDate
)
  implements AuthorisationDTOCommonFields {}
