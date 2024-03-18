package fi.oph.akr.audit.dto;

import fi.oph.akr.api.dto.clerk.MeetingDateDTO;
import fi.oph.akr.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.util.DateUtil;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record MeetingDateAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull String date
)
  implements AuditEntityDTO {
  public MeetingDateAuditDTO(MeetingDateUpdateDTO date) {
    this(date.id(), date.version(), DateUtil.formatOptionalDate(date.date()));
  }
  public MeetingDateAuditDTO(MeetingDateDTO date) {
    this(date.id(), date.version(), DateUtil.formatOptionalDate(date.date()));
  }
  public MeetingDateAuditDTO(MeetingDate date) {
    this(date.getId(), date.getVersion(), DateUtil.formatOptionalDate(date.getDate()));
  }
}
