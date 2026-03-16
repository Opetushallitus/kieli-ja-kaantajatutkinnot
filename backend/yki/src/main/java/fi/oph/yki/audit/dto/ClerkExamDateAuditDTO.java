package fi.oph.yki.audit.dto;

import fi.oph.yki.api.dto.clerk.ClerkExamDateDTO;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.util.DateUtil;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkExamDateAuditDTO(
  Long id,
  String examDate,
  String registrationStartDate,
  String registrationEndDate,
  List<ExamSessionType> examTypes
) {
  public ClerkExamDateAuditDTO(final ClerkExamDateDTO dto) {
    this(
      dto.id(),
      DateUtil.formatOptionalDate(dto.examDate()),
      DateUtil.formatOptionalDate(dto.registrationStartDate()),
      DateUtil.formatOptionalDate(dto.registrationEndDate()),
      dto.examTypes()
    );
  }
}
