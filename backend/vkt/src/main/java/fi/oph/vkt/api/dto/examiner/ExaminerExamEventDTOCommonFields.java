package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.NonNull;

public interface ExaminerExamEventDTOCommonFields {
  ExamLanguage language();
  LocalDate date();
  Boolean isHidden();
  MunicipalityDTO municipality();
  String location();
  String examTime();
  String otherInformation();
  LocalDateTime registrationCloses();
  Long maxParticipants();
}
