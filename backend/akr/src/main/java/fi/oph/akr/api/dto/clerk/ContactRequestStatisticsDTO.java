package fi.oph.akr.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ContactRequestStatisticsDTO(
  @NonNull Integer year,
  @NonNull Integer month,
  @NonNull Integer day,
  @NonNull String fromLang,
  @NonNull String toLang,
  @NonNull Long contactRequestCount,
  @NonNull Long translatorCount
) {}
