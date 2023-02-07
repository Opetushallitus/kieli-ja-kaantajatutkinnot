package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record AuthorisationCreateDTO(
  @NonNull @NotNull AuthorisationBasis basis,
  @Size(max = 255) @NonNull @NotBlank String from,
  @Size(max = 255) @NonNull @NotBlank String to,
  @NonNull @NotNull LocalDate termBeginDate,
  LocalDate termEndDate,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber,
  LocalDate examinationDate
)
  implements AuthorisationDTOCommonFields {}
