package fi.oph.vkt.api.dto;

import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEnrollmentContactCreateDTO(
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  @Size(max = 1024) String previousEnrollment,
  @Size(max = 255) @NonNull @NotBlank String email,
  @Size(max = 255) @NonNull @NotBlank String firstName,
  @Size(max = 255) @NonNull @NotBlank String lastName
) {
  public PublicEnrollmentContactCreateDTO {
    previousEnrollment = StringUtil.sanitize(previousEnrollment);
    email = StringUtil.sanitize(email);
    firstName = StringUtil.sanitize(firstName);
    lastName = StringUtil.sanitize(lastName);
  }
}
