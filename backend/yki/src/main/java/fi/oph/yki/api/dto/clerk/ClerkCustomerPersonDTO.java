package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkCustomerPersonDTO(
  String firstName,
  String lastName,
  String ssn,
  String birthdate,
  String oid,
  Boolean individualised,
  String nationalityCode,
  String phoneNumber,
  String streetAddress,
  String postOffice,
  String zip,
  String email
) {}
