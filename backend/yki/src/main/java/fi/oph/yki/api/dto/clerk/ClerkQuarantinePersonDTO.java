package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

/**
 * A person that is inspected in the quarantine - domain/context.
 * Can be quarantined person, or the person, whose information was set in the registration form. They can be also the same person.
 */
@Builder
public record ClerkQuarantinePersonDTO(
  String firstName,
  String lastName,
  String birthdate,
  String ssn,
  String email,
  String phoneNumber
) {}
