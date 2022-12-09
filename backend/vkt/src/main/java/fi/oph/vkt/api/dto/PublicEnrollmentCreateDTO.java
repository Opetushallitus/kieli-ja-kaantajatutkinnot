package fi.oph.vkt.api.dto;

import java.time.LocalDate;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentCreateDTO(
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  LocalDate previousEnrollmentDate,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country
) {}
