package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.ExaminationType;
import java.time.LocalDate;

public interface ClerkQualificationDTOCommonFields {
  String fromLang();

  String toLang();

  LocalDate beginDate();

  LocalDate endDate();

  ExaminationType examinationType();

  Boolean permissionToPublish();

  String diaryNumber();
}
