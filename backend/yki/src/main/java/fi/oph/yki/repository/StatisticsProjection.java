package fi.oph.yki.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface StatisticsProjection {
  String getOrganizerOid();
  LocalDate getExamDate();
  String getLanguageCode();
  String getLevelCode();
  String getMunicipality();
  Integer getMaxParticipants();
  Long getRegisteredCount();
  Integer getPeakParticipants();
  Integer getPeakQueue();
  LocalDateTime getFilledAt();
  LocalDateTime getQueuePeakAt();
}
