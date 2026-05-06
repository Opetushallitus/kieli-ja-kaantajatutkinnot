package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateQuarantineRequest(
  @NotBlank @Size(min = 3, max = 3) String languageCode,
  @NotNull LocalDate startDate,
  @NotNull LocalDate endDate,
  @NotBlank String firstName,
  @NotBlank String lastName,
  @NotBlank String diaryNumber,
  LocalDate birthdate,
  String ssn,
  String email,
  String phoneNumber
) {}
