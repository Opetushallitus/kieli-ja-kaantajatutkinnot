package fi.oph.akr.api.dto.clerk.modify;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminationDateCreateDTO(@NonNull @NotNull LocalDate date) {}
