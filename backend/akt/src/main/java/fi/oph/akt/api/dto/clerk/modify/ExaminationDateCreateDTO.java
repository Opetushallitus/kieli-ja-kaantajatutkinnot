package fi.oph.akt.api.dto.clerk.modify;

import java.time.LocalDate;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminationDateCreateDTO(@NonNull @NotNull LocalDate date) {}
