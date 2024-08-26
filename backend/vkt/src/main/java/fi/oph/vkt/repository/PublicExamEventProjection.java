package fi.oph.vkt.repository;

import fi.oph.vkt.model.type.ExamLanguage;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PublicExamEventProjection(
  long id,
  ExamLanguage language,
  LocalDate date,
  LocalDateTime registrationCloses,
  LocalDateTime registrationOpens,
  long participants,
  long maxParticipants
) {}
