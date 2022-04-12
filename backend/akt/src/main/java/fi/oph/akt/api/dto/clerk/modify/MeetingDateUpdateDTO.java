package fi.oph.akt.api.dto.clerk.modify;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

public record MeetingDateUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull LocalDate date
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public MeetingDateUpdateDTO {}
}
