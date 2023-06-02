package fi.oph.otr.api.dto.clerk.modify;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateCreateDTO(@NonNull @NotNull LocalDate date) {}
