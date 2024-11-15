package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerEnrollmentAppointmentUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean oralSkill,
  @NonNull @NotNull Boolean textualSkill,
  @NonNull @NotNull Boolean understandingSkill,
  @NonNull @NotNull Boolean speakingPartialExam,
  @NonNull @NotNull Boolean speechComprehensionPartialExam,
  @NonNull @NotNull Boolean writingPartialExam,
  @NonNull @NotNull Boolean readingComprehensionPartialExam,
  String previousEnrollment,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  String phoneNumber,
  @Size(max = 255) String street,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 255) String country,
  @NonNull @NotNull List<ClerkPaymentDTO> payments,
  Long examEvent
)
  implements EnrollmentDTOSkillFields {
  public ExaminerEnrollmentAppointmentUpdateDTO {
    previousEnrollment = StringUtil.sanitize(previousEnrollment);
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
  }
}
