package fi.oph.akt.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateDTO(@NonNull Long id, @NonNull Integer version, @NonNull LocalDate date) {}
