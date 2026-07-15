package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ClerkOrganizerExamSessionLocationDTO(
  String lang,
  String extraInformation,
  String name,
  String otherLocationInfo,
  String streetAddress,
  String postOffice,
  String zip
) {}
