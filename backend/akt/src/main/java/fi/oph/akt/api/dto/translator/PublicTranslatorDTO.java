package fi.oph.akt.api.dto.translator;

import fi.oph.akt.api.dto.LanguagePairDTO;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

public record PublicTranslatorDTO(
  @NonNull Long id,
  @NonNull String firstName,
  @NonNull String lastName,
  String town,
  String country,
  @NonNull List<LanguagePairDTO> languagePairs
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public PublicTranslatorDTO {}
}
