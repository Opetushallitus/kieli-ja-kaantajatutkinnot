package fi.oph.akt.api.dto.clerk;

import fi.oph.akt.api.dto.LanguagePairDTO;
import fi.oph.akt.model.AuthorisationBasis;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record AuthorisationDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull LanguagePairDTO languagePair,
  @NonNull AuthorisationBasis basis,
  LocalDate termBeginDate,
  LocalDate termEndDate,
  @NonNull Boolean permissionToPublish,
  String diaryNumber,
  LocalDate examinationDate
) {}
