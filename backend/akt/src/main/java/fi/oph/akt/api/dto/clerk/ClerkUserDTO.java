package fi.oph.akt.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

public record ClerkUserDTO(@NonNull String oid) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkUserDTO {}
}
