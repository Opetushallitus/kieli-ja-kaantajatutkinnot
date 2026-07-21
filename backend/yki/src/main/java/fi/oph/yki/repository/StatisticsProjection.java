package fi.oph.yki.repository;

import java.time.LocalDate;

public interface StatisticsProjection {
  String getOrganizerOid();
  LocalDate getExamDate();
  String getLanguageCode();
  String getLevelCode();
  String getMunicipality();
  Integer getMaxParticipants();
  Long getRegisteredCount();
}
