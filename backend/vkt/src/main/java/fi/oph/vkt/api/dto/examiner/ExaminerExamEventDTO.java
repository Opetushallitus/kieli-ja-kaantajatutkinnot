package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerExamEventDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull ExamLanguage language,
  @NonNull @NotNull LocalDate date,
  @NonNull @NotNull Boolean isHidden,
  @NonNull @NotNull MunicipalityDTO municipality,
  @NonNull @NotNull String location,
  LocalDateTime registrationCloses,
  Long maxParticipants
  // TODO Should be List<EnrollmentAppointmentDTO> or something after merge
  //@NonNull @NotNull List<ClerkEnrollmentDTO> enrollments
) {}
