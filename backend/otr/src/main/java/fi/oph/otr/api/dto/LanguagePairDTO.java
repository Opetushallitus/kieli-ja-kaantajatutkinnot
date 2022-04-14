package fi.oph.otr.api.dto;

import lombok.Builder;
import lombok.NonNull;

public record LanguagePairDTO(@NonNull String from, @NonNull String to) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public LanguagePairDTO {}
}
