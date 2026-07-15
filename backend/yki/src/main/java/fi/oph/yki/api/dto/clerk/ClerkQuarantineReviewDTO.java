package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ClerkQuarantineReviewDTO(
  Long id,
  boolean quarantined,
  Long quarantineId,
  Long registrationId,
  LocalDateTime updated,
  LocalDate examDate,
  String languageCode,
  String levelCode,
  String state,
  ClerkQuarantinePersonDTO quarantinedPerson,
  ClerkQuarantinePersonDTO registrant
) {}
