package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ClerkStatisticsRowDTO(
  String organizer,
  LocalDate examDate,
  String examLanguage,
  String examLevel,
  String municipality,
  Integer availablePlaces,
  Long registeredCount,
  Integer peakParticipants,
  Integer peakQueue,
  LocalDateTime filledAt,
  LocalDateTime queuePeakAt
) {}
