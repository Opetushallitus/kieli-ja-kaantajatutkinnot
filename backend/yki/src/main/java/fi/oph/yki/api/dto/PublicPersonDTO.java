package fi.oph.yki.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.Builder;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PublicPersonDTO(
  String oid,
  String firstName,
  String lastName,
  String email,
  String phoneNumber,
  String streetAddress,
  String postOffice,
  String zip,
  String countryCode,
  List<PublicPersonRegistrationDTO> registrations
) {}
