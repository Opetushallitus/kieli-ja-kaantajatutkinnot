package fi.oph.vkt.api.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicExaminerExamDateDTO(@NonNull LocalDate examDate, @NonNull Boolean isFull) {}
