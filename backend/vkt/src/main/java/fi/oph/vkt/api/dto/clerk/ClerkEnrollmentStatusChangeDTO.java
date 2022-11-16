package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.EnrollmentStatus;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkEnrollmentStatusChangeDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull EnrollmentStatus newStatus
) {}
