package fi.oph.otr.api.dto.clerk;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterQualificationsDTO(
  @NonNull List<ClerkQualificationDTO> effective,
  @NonNull List<ClerkQualificationDTO> expiring,
  @NonNull List<ClerkQualificationDTO> expired,
  @NonNull List<ClerkQualificationDTO> expiredDeduplicated
) {}
