package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.FreeRegistrationStatus;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.RegistrationLangOfService;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDetailsDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull FreeRegistrationStatus status,
  @NonNull @NotNull RegistrationLangOfService languageOfService,
  @NonNull @NotNull ClerkApprovalExamSessionDTO examSession,
  @NonNull @NotNull FreeRegistrationType freeRegistrationBasis,
  int freeRegistrationsLeft,
  String supplementRequestDueDate,
  String assessmentDate,
  List<ClerkMessageDTO> messages,
  List<ClerkApprovalAttachmentsDTO> attachments
) {}
