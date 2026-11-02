package fi.oph.yki.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ParticipantOnrCsvProjection {
  String getOid();

  Long getParticipantId();

  Boolean getIndividualised();

  LocalDateTime getModified();

  LocalDate getExamDate();

  String getEvaluationState();
}
