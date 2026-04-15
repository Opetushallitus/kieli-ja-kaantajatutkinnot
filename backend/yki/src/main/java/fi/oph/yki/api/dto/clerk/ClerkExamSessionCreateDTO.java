package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ClerkExamSessionCreateDTO(
  @NotNull @Size(max = 255) String organizerOid,
  @Size(max = 255) String officeOid,
  @NotNull Long examDateId,
  @Size(max = 255) String language,
  @Size(max = 255) String level,
  ExamSessionType type,
  @NotNull Integer maxParticipantsTotal,
  Integer maxParticipantsPartial1,
  Integer maxParticipantsPartial2,
  @Size(max = 255) String streetAddress,
  @Size(max = 255) String zip,
  @Size(max = 255) String postOffice,
  @Size(max = 255) String name,
  @Size(max = 255) String otherLocationInfo,
  @Size(max = 255) String contactName,
  @Size(max = 255) String contactEmail,
  @Size(max = 255) String contactPhoneNumber
) {
  public ClerkExamSessionCreateDTO {
    organizerOid = StringUtil.sanitize(organizerOid);
    officeOid = StringUtil.sanitize(officeOid);
    language = StringUtil.sanitize(language);
    level = StringUtil.sanitize(level);
    streetAddress = StringUtil.sanitize(streetAddress);
    zip = StringUtil.sanitize(zip);
    postOffice = StringUtil.sanitize(postOffice);
    name = StringUtil.sanitize(name);
    otherLocationInfo = StringUtil.sanitize(otherLocationInfo);
    contactName = StringUtil.sanitize(contactName);
    contactEmail = StringUtil.sanitize(contactEmail);
    contactPhoneNumber = StringUtil.sanitize(contactPhoneNumber);
  }
}
