package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.FreeRegistrationStatus;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.RegistrationLangOfCommunication;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDetailsDTO(
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull FreeRegistrationStatus status,
  @NonNull @NotNull FreeRegistrationType freeEnrollmentBasis,
  @NonNull @NotNull RegistrationLangOfCommunication languageOfCommunication,
  int freeEnrollmentsLeft,
  LocalDate supplementRequestDueDate,
  LocalDate assessmentDate,
  LocalDate examDate,
  List<ClerkApprovalCommentDTO> comment,
  List<ClerkApprovalAttachmentsDTO> attachments
) {}
