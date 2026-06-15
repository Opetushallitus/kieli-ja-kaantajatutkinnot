package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
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
  Integer maxParticipantsReadListen,
  Integer maxParticipantsSpeakWrite,
  @Size(max = 255) String startTimeReadListen,
  @Size(max = 255) String startTimeSpeakWrite,
  List<ClerkExamSessionLocationCreateDTO> location,
  @Size(max = 255) String contactName,
  @Size(max = 255) String contactEmail,
  @Size(max = 255) String contactPhoneNumber
) {
  public ClerkExamSessionCreateDTO {
    organizerOid = StringUtil.sanitize(organizerOid);
    officeOid = StringUtil.sanitize(officeOid);
    language = StringUtil.sanitize(language);
    level = StringUtil.sanitize(level);
    contactName = StringUtil.sanitize(contactName);
    contactEmail = StringUtil.sanitize(contactEmail);
    contactPhoneNumber = StringUtil.sanitize(contactPhoneNumber);
  }
}
