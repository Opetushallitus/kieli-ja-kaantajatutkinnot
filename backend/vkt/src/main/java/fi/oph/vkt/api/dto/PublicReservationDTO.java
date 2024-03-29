package fi.oph.vkt.api.dto;

import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicReservationDTO(
  @NonNull Long id,
  @NonNull ZonedDateTime createdAt,
  @NonNull ZonedDateTime expiresAt,
  ZonedDateTime renewedAt,
  @NonNull Boolean isRenewable
) {}
