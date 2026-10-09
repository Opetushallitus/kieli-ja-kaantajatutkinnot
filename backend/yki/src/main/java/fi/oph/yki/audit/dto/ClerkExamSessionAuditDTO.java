package fi.oph.yki.audit.dto;

import fi.oph.yki.api.dto.clerk.ClerkExamSessionDTO;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.util.DateUtil;
import lombok.Builder;

@Builder
public record ClerkExamSessionAuditDTO(
  Long id,
  String language,
  String level,
  ExamSessionType type,
  Integer maxParticipantsTotal,
  Integer maxParticipantsReadListen,
  Integer maxParticipantsSpeakWrite,
  String startTimeReadListen,
  String startTimeSpeakWrite,
  String contactName,
  String contactEmail,
  String contactPhoneNumber,
  String officeOid,
  String date,
  String registrationStartDate,
  String registrationEndDate,
  String organizerOid
) {
  public ClerkExamSessionAuditDTO(final ClerkExamSessionDTO dto) {
    this(
      dto.id(),
      dto.language(),
      dto.level(),
      dto.type(),
      dto.maxParticipantsTotal(),
      dto.maxParticipantsReadListen(),
      dto.maxParticipantsSpeakWrite(),
      dto.startTimeReadListen(),
      dto.startTimeSpeakWrite(),
      dto.contactName(),
      dto.contactEmail(),
      dto.contactPhoneNumber(),
      dto.officeOid(),
      DateUtil.formatOptionalDate(dto.date()),
      DateUtil.formatOptionalDate(dto.registrationStartDate()),
      DateUtil.formatOptionalDate(dto.registrationEndDate()),
      dto.organizerOid()
    );
  }
}
