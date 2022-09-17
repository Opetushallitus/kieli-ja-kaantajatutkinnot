package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.EnrollmentStatus;
import java.time.LocalDate;
import java.util.List;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkEnrollmentDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @NonNull @NotNull EnrollmentStatus status,
  LocalDate previousEnrollmentDate,
  @NonNull @NotNull Boolean digitalCertificateConsent,
  @NonNull @NotNull List<ClerkExamPaymentDTO> payments
) {}
