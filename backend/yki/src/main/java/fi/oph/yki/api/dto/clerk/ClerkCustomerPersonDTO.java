package fi.oph.yki.api.dto.clerk;

public record ClerkCustomerPersonDTO(
  String firstName,
  String lastName,
  String ssn,
  String oid,
  String nationalityCode,
  String languageOfService,
  String languageOfCertificate,
  String phoneNumber,
  String streetAddress,
  String email
) {}
