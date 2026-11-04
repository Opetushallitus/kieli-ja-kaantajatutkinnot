package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicExamSessionLocationDTO(
  String name,
  String streetAddress,
  String postOffice,
  String zip,
  String otherLocationInfo,
  String extraInformation,
  String lang
) {}
