package fi.oph.yki.api.dto;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ExamDateDTO(long id, LocalDate examDate) {}
