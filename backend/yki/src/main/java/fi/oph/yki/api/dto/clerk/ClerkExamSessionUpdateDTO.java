package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkExamSessionUpdateDTO(
  @Size(max = 255) String language,
  @Size(max = 255) String level,
  ExamSessionType type,
  @NotNull Integer maxParticipantsTotal,
  Integer maxParticipantsPartial1,
  Integer maxParticipantsPartial2,
  @Size(max = 255) String startTime,
  @Size(max = 255) String startTimePart1,
  @Size(max = 255) String startTimePart2,
  List<ClerkExamSessionLocationCreateDTO> location,
  @Size(max = 255) String contactName,
  @Size(max = 255) String contactEmail,
  @Size(max = 255) String contactPhoneNumber
) {
  public ClerkExamSessionUpdateDTO {
    language = StringUtil.sanitize(language);
    level = StringUtil.sanitize(level);
    contactName = StringUtil.sanitize(contactName);
    contactEmail = StringUtil.sanitize(contactEmail);
    contactPhoneNumber = StringUtil.sanitize(contactPhoneNumber);
  }
}
