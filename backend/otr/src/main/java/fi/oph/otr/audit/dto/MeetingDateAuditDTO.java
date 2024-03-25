package fi.oph.otr.audit.dto;

import fi.oph.otr.api.dto.clerk.MeetingDateDTO;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.util.DateUtil;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull String date
) {
  public MeetingDateAuditDTO(MeetingDate meetingDate) {
    this(meetingDate.getId(), meetingDate.getVersion(), DateUtil.formatOptionalDate(meetingDate.getDate()));
  }
  public MeetingDateAuditDTO(MeetingDateDTO meetingDate) {
    this(meetingDate.id(), meetingDate.version(), DateUtil.formatOptionalDate(meetingDate.date()));
  }
}
