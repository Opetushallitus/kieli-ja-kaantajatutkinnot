package fi.oph.vkt.api.dto.clerk;

import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ClerkExamEventDTOCommonFields {
  ExamLanguage language();
  ExamLevel level();
  LocalDate date();
  LocalDateTime registrationCloses();
  LocalDateTime registrationOpens();
  Boolean isHidden();
  Long maxParticipants();
}
