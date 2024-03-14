package fi.oph.akr.audit.dto;

import fi.oph.akr.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationBasis;
import fi.oph.akr.util.DateUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.NonNull;

public record AuthorisationAuditDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull AuthorisationBasis basis,
  @Size(max = 10) @NonNull @NotBlank String from,
  @Size(max = 10) @NonNull @NotBlank String to,
  @NonNull @NotNull String termBeginDate,
  String termEndDate,
  @NonNull @NotNull Boolean permissionToPublish,
  @Size(max = 255) String diaryNumber,
  String examinationDate
)
  implements AuditEntityDTO {
  public AuthorisationAuditDTO(AuthorisationUpdateDTO update) {
    this(
      update.id(),
      update.version(),
      update.basis(),
      update.from(),
      update.to(),
      DateUtil.formatOptionalDate(update.termBeginDate()),
      DateUtil.formatOptionalDate(update.termEndDate()),
      update.permissionToPublish(),
      update.diaryNumber(),
      DateUtil.formatOptionalDate(update.examinationDate())
    );
  }

  public AuthorisationAuditDTO(Authorisation authorisation) {
    this(
      authorisation.getId(),
      authorisation.getVersion(),
      authorisation.getBasis(),
      authorisation.getFromLang(),
      authorisation.getToLang(),
      DateUtil.formatOptionalDate(authorisation.getTermBeginDate()),
      DateUtil.formatOptionalDate(authorisation.getTermEndDate()),
      authorisation.isPermissionToPublish(),
      authorisation.getDiaryNumber(),
      DateUtil.formatOptionalDate(authorisation.getExaminationDate().getDate())
    );
  }
}
