package fi.oph.otr.api.dto.clerk.modify;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull LocalDate date
) {}
