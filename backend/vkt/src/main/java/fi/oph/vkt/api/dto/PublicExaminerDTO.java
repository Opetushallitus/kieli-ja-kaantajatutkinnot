package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicExaminerDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull String lastName,
  @NonNull @NotNull String firstName,
  @NonNull @NotNull List<ExamLanguage> languages,
  @NonNull @NotNull List<PublicMunicipalityDTO> municipalities,
  @NonNull @NotNull List<PublicExaminerExamDateDTO> examDates
) {}
