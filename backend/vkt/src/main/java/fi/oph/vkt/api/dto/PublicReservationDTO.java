package fi.oph.vkt.api.dto;

import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicReservationDTO(
  @NonNull Long id,
  @NonNull ZonedDateTime expiresAt,
  @NonNull ZonedDateTime expiresUpdatedAt,
  @NonNull Integer renewCount,
  @NonNull Boolean active,
  @NonNull Boolean isRenewable
) {}
