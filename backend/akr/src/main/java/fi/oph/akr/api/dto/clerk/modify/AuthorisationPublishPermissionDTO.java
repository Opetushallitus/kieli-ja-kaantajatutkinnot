package fi.oph.akr.api.dto.clerk.modify;

import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record AuthorisationPublishPermissionDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean permissionToPublish
) {}
