package fi.oph.akt.api.dto.clerk;

import fi.oph.akt.api.dto.LanguagePairDTO;
import fi.oph.akt.model.AuthorisationBasis;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

public record AuthorisationDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull LanguagePairDTO languagePair,
  @NonNull AuthorisationBasis basis,
  LocalDate termBeginDate,
  LocalDate termEndDate,
  @NonNull Boolean permissionToPublish,
  String diaryNumber,
  LocalDate autDate
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public AuthorisationDTO {}
}
