package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicAppointmentExamDateDTO(
  @NonNull @NotNull LocalDate date,
  @NonNull @NotNull String location,
  @NonNull @NotNull ExamLanguage language,
  @NonNull PublicExaminerNameDTO examiner
) {}
