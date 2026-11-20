package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkCustomerPersonDTO(
  String firstName,
  String lastName,
  String ssn,
  String oid,
  Boolean individualised,
  // The person in the ONR UI (henkilo-ui). Null when the user gets no link.
  String onrUrl,
  String nationalityCode,
  String phoneNumber,
  String streetAddress,
  String postOffice,
  String zip,
  String email
) {}
