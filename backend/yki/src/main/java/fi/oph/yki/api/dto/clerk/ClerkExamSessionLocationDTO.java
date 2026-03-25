package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamSessionLocationDTO(
  String lang,
  String extraInformation,
  String name,
  String otherLocationInfo,
  String streetAddress,
  String postOffice,
  String zip
) {}
