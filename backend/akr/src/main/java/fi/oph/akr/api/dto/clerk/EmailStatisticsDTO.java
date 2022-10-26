package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.model.EmailType;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EmailStatisticsDTO(
  @NonNull Integer year,
  @NonNull Integer month,
  @NonNull Integer day,
  @NonNull EmailType emailType,
  @NonNull Long count
) {}
