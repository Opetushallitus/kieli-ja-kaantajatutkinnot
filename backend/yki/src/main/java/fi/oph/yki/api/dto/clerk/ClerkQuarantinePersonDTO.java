package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkQuarantinePersonDTO(
  String firstName,
  String lastName,
  String birthdate,
  String ssn,
  String email,
  String phoneNumber
) {}
