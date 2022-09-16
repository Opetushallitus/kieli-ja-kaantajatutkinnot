package fi.oph.vkt.repository;

import fi.oph.vkt.model.exam.ExamLanguage;
import fi.oph.vkt.model.exam.ExamLevel;
import java.time.LocalDate;

public record ClerkExamEventProjection(
  long id,
  ExamLanguage language,
  ExamLevel level,
  LocalDate date,
  LocalDate registrationCloses,
  int participants,
  int maxParticipants,
  boolean isVisible
) {}
