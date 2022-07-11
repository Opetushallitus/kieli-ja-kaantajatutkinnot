package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.model.AuthorisationBasis;
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
