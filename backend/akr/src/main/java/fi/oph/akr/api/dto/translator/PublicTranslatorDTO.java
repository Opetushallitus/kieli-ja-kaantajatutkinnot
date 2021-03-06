package fi.oph.akr.api.dto.translator;

import fi.oph.akr.api.dto.LanguagePairDTO;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicTranslatorDTO(
  @NonNull Long id,
  @NonNull String firstName,
  @NonNull String lastName,
  String town,
  String country,
  @NonNull List<LanguagePairDTO> languagePairs
) {}
