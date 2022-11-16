package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;

public interface ClerkExamEventDTOCommonFields {
  ExamLanguage language();
  ExamLevel level();
  LocalDate date();
  LocalDate registrationCloses();
  Boolean isHidden();
  Long maxParticipants();
}
