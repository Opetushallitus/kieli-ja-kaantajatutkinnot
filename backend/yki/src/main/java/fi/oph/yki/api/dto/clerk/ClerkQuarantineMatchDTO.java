package fi.oph.yki.api.dto.clerk;

import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkQuarantineMatchDTO(
  Long id,
  String quarantineLang,
  Instant created,
  ClerkQuarantinePersonDTO quarantinedPerson,
  ClerkQuarantinePersonDTO registrant,
  Long registrationId,
  String state,
  LocalDate examDate,
  String languageCode
) {}
