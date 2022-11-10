package fi.oph.vkt.repository;

import fi.oph.vkt.model.type.ExamLanguage;
import java.time.LocalDate;

public record PublicExamEventProjection(
  long id,
  ExamLanguage language,
  LocalDate date,
  LocalDate registrationCloses,
  long participants,
  int maxParticipants
) {}
