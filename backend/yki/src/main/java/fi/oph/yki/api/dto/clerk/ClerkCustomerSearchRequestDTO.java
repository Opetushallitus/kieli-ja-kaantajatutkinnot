package fi.oph.yki.api.dto.clerk;

import jakarta.annotation.Nullable;
import lombok.Builder;

@Builder
public record ClerkCustomerSearchRequestDTO(
  @Nullable String personQuery,
  @Nullable Long organizerId,
  @Nullable Long examSessionId,
  @Nullable String languageCode,
  @Nullable String levelCode
) {}
