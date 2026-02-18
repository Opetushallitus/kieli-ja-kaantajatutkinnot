package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ClerkExamSessionUpdateDTO(
  @Size(max = 255) String language,
  @Size(max = 255) String level,
  @NotNull Integer maxParticipants,
  @Size(max = 255) String streetAddress,
  @Size(max = 255) String zip,
  @Size(max = 255) String postOffice,
  @Size(max = 255) String contactName,
  @Size(max = 255) String contactEmail,
  @Size(max = 255) String contactPhoneNumber
) {
  public ClerkExamSessionUpdateDTO {
    language = StringUtil.sanitize(language);
    level = StringUtil.sanitize(level);
    streetAddress = StringUtil.sanitize(streetAddress);
    zip = StringUtil.sanitize(zip);
    postOffice = StringUtil.sanitize(postOffice);
    contactName = StringUtil.sanitize(contactName);
    contactEmail = StringUtil.sanitize(contactEmail);
    contactPhoneNumber = StringUtil.sanitize(contactPhoneNumber);
  }
}
