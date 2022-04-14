package fi.oph.otr.api.dto;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

public record InterpreterDTO(
  @NonNull String firstName,
  @NonNull String lastName,
  @NonNull String area,
  @NonNull List<LanguagePairDTO> languages
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public InterpreterDTO {}
}
