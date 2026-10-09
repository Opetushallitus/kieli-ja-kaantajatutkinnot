package fi.oph.yki.audit.dto;

import fi.oph.yki.api.dto.clerk.ClerkOrganizerDTO;
import fi.oph.yki.api.dto.clerk.ClerkOrganizerLanguageDTO;
import fi.oph.yki.util.DateUtil;
import java.util.List;
import lombok.Builder;

@Builder
public record ClerkOrganizerAuditDTO(
  long id,
  String oid,
  String agreementStartDate,
  String agreementEndDate,
  String contactName,
  String contactEmail,
  String contactPhoneNumber,
  List<ClerkOrganizerLanguageDTO> languages,
  String extra
) {
  public ClerkOrganizerAuditDTO(final ClerkOrganizerDTO dto) {
    this(
      dto.id(),
      dto.oid(),
      DateUtil.formatOptionalDate(dto.agreementStartDate()),
      DateUtil.formatOptionalDate(dto.agreementEndDate()),
      dto.contactName(),
      dto.contactEmail(),
      dto.contactPhoneNumber(),
      dto.languages(),
      dto.extra()
    );
  }
}
