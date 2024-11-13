package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerExamEventUpsertDTO(
  Long id,
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull LocalDate date,
  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull MunicipalityDTO municipality,
  String location,
  String examTime,
  String otherInformation,
  LocalDateTime registrationCloses,
  Long maxParticipants
) {}
