package fi.oph.vkt.repository;

import fi.oph.vkt.model.exam.ExamLanguage;
import java.time.LocalDate;

public record PublicExamEventProjection(
  long id,
  ExamLanguage language,
  LocalDate date,
  LocalDate registrationCloses,
  int participants,
  int maxParticipants,
  boolean hasCongestion
) {}
