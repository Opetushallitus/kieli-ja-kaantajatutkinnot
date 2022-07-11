package fi.oph.akr.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminationDateDTO(@NonNull Long id, @NonNull Integer version, @NonNull LocalDate date) {}
