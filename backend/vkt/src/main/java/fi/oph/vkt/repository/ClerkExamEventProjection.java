package fi.oph.vkt.repository;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClerkExamEventProjection(
  long id,
  ExamLanguage language,
  ExamLevel level,
  LocalDate date,
  LocalDateTime registrationCloses,
  LocalDateTime registrationOpens,
  long participants,
  long maxParticipants,
  boolean isHidden,
  long unApprovedFreeEnrollments
) {}
