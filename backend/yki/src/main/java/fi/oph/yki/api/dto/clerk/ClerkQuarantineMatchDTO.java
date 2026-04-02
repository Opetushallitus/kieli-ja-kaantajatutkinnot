package fi.oph.yki.api.dto.clerk;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.time.LocalDate;

public record ClerkQuarantineMatchDTO(
  Long id,
  String quarantineLang,
  String birthdate,
  Instant created,
  String ssn,
  String firstName,
  String lastName,
  String email,
  String phoneNumber,
  Long registrationId,
  ObjectNode form,
  String state,
  LocalDate examDate,
  String languageCode
) {}
