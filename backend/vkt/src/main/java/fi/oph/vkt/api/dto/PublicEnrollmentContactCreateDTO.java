package fi.oph.vkt.api.dto;

import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentContactCreateDTO(
  @NonNull @NotNull Boolean isFullExam,
  @Size(max = 1024) String partialExamSelection,
  @NonNull @NotNull Boolean hasPreviousEnrollment,
  List<FreeEnrollmentAttachmentDTO> attachments,
  @Size(max = 10240) String message,
  @Size(max = 255) @NonNull @NotBlank String phoneNumber,
  @Size(max = 255) @NonNull @NotBlank String email,
  @Size(max = 255) @NonNull @NotBlank String firstName,
  @Size(max = 255) @NonNull @NotBlank String lastName
) {
  public PublicEnrollmentContactCreateDTO {
    partialExamSelection = StringUtil.sanitize(partialExamSelection);
    message = StringUtil.sanitize(message);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    email = StringUtil.sanitize(email);
    firstName = StringUtil.sanitize(firstName);
    lastName = StringUtil.sanitize(lastName);
  }
}
