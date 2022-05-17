package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.QualificationExaminationType;
import java.time.LocalDate;

public interface ClerkQualificationDTOCommonFields {
  String fromLang();

  String toLang();

  LocalDate beginDate();

  LocalDate endDate();

  QualificationExaminationType examinationType();

  Boolean permissionToPublish();

  String diaryNumber();
}
