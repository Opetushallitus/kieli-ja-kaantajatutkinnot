package fi.oph.akr.api.dto.translator;

import fi.oph.akr.api.dto.LanguagePairsDictDTO;
import fi.oph.akr.api.dto.TownAndCountryDTO;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicTranslatorResponseDTO(
  @NonNull List<PublicTranslatorDTO> translators,
  @NonNull LanguagePairsDictDTO langs,
  @NonNull List<TownAndCountryDTO> towns
) {}
