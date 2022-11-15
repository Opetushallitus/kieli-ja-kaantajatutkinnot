package fi.oph.vkt.repository;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;

public record ClerkExamEventProjection(
  long id,
  ExamLanguage language,
  ExamLevel level,
  LocalDate date,
  LocalDate registrationCloses,
  long participants,
  long maxParticipants,
  boolean isVisible
) {}
