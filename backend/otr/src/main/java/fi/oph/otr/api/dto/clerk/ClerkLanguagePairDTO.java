package fi.oph.otr.api.dto.clerk;

import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record ClerkLanguagePairDTO(
  @NonNull @NotBlank String from,
  @NonNull @NotBlank String to,
  @NonNull @NotNull LocalDate beginDate,
  @NonNull @NotNull LocalDate endDate
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public ClerkLanguagePairDTO {}
}
