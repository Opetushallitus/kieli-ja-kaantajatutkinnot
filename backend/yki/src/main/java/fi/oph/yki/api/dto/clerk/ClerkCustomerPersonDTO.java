package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkCustomerPersonDTO(
  String firstName,
  String lastName,
  String ssn,
  String oid,
  String nationalityCode,
  String phoneNumber,
  String streetAddress,
  String email
) {}
