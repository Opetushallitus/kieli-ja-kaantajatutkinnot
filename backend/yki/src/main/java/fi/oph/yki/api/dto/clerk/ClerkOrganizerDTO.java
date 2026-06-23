package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ClerkOrganizerDTO(
  long id,
  String oid,
  LocalDate agreementStartDate,
  LocalDate agreementEndDate,
  String contactName,
  String contactEmail,
  String contactPhoneNumber,
  List<ClerkOrganizerLanguageDTO> languages,
  String extra
) {}
