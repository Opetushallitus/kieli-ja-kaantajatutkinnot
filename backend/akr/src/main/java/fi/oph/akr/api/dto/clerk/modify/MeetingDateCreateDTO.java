package fi.oph.akr.api.dto.clerk.modify;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateCreateDTO(@NonNull @NotNull LocalDate date) {}
