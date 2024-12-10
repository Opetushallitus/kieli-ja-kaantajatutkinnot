package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.model.type.ExamLanguage;
import java.time.LocalDate;

public interface ExaminerExamEventDTOCommonFields {
  ExamLanguage language();
  LocalDate date();
  Boolean isHidden();
  MunicipalityDTO municipality();
  String location();
  String examTime();
  String otherInformation();
  LocalDate registrationCloses();
  Long maxParticipants();
}
