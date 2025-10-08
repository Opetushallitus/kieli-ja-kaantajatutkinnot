package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationLangOfCommunication;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDetailsDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull RegistrationState status,
  //@NonNull @NotNull FreeRegistrationType freeEnrollmentBasis,
  @NonNull @NotNull RegistrationLangOfCommunication languageOfCommunication,
  @NonNull @NotNull ClerkApprovalExamSessionDTO examSession,
  @NonNull @NotNull String freeRegistrationBasis,
  int freeRegistrationsLeft,
  String supplementRequestDueDate,
  String assessmentDate,
  List<ClerkApprovalCommentDTO> comments,
  List<ClerkApprovalAttachmentsDTO> attachments
) {}
