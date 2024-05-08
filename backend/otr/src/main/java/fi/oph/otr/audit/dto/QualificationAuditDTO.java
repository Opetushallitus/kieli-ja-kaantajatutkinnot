package fi.oph.otr.audit.dto;

import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkQualificationUpdateDTO;
import fi.oph.otr.model.ExaminationType;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.util.DateUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.NonNull;

public record QualificationAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @Size(max = 10) @NonNull @NotBlank String fromLang,
  @Size(max = 10) @NonNull @NotBlank String toLang,
  @NonNull @NotNull String beginDate,
  @NonNull @NotNull String endDate,
  @NonNull @NotNull ExaminationType examinationType,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber
) {
  public QualificationAuditDTO(ClerkQualificationDTO updateDTO) {
    this(
      updateDTO.id(),
      updateDTO.version(),
      updateDTO.fromLang(),
      updateDTO.toLang(),
      DateUtil.formatOptionalDate(updateDTO.beginDate()),
      DateUtil.formatOptionalDate(updateDTO.endDate()),
      updateDTO.examinationType(),
      updateDTO.permissionToPublish(),
      updateDTO.diaryNumber()
    );
  }
  public QualificationAuditDTO(ClerkQualificationUpdateDTO updateDTO) {
    this(
      updateDTO.id(),
      updateDTO.version(),
      updateDTO.fromLang(),
      updateDTO.toLang(),
      DateUtil.formatOptionalDate(updateDTO.beginDate()),
      DateUtil.formatOptionalDate(updateDTO.endDate()),
      updateDTO.examinationType(),
      updateDTO.permissionToPublish(),
      updateDTO.diaryNumber()
    );
  }
  public QualificationAuditDTO(Qualification qualification) {
    this(
      qualification.getId(),
      qualification.getVersion(),
      qualification.getFromLang(),
      qualification.getToLang(),
      DateUtil.formatOptionalDate(qualification.getBeginDate()),
      DateUtil.formatOptionalDate(qualification.getEndDate()),
      qualification.getExaminationType(),
      qualification.isPermissionToPublish(),
      qualification.getDiaryNumber()
    );
  }
}
