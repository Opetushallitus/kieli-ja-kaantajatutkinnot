package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkStatisticsRowDTO(
  String organizer,
  LocalDate examDate,
  String examLanguage,
  String examLevel,
  String registrationState,
  String municipality,
  Integer availablePlaces
) {}
