package fi.oph.akr.api.dto.clerk;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorAuthorisationsDTO(
  @NonNull List<AuthorisationDTO> effective,
  @NonNull List<AuthorisationDTO> expiring,
  @NonNull List<AuthorisationDTO> expired,
  @NonNull List<AuthorisationDTO> expiredDeduplicated,
  @NonNull List<AuthorisationDTO> formerVir
) {}
