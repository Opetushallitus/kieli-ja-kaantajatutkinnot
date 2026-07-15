package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ClerkOrganizerCreateDTO(
  @NotNull @Size(max = 255) String oid,
  @NotNull LocalDate agreementStartDate,
  @NotNull LocalDate agreementEndDate,
  @Size(max = 255) String contactName,
  @Size(max = 255) String contactEmail,
  @Size(max = 255) String contactPhoneNumber,
  List<ClerkOrganizerLanguageDTO> languages,
  String extra
) {
  public ClerkOrganizerCreateDTO {
    oid = StringUtil.sanitize(oid);
    contactEmail = StringUtil.sanitize(contactEmail);
    contactName = StringUtil.sanitize(contactName);
    contactPhoneNumber = StringUtil.sanitize(contactPhoneNumber);
    extra = StringUtil.sanitize(extra);
  }
}
