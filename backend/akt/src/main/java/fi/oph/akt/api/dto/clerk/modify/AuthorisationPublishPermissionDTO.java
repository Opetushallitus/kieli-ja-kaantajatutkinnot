package fi.oph.akt.api.dto.clerk.modify;

import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record AuthorisationPublishPermissionDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean permissionToPublish
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public AuthorisationPublishPermissionDTO {}
}
