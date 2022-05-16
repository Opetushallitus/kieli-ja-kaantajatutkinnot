package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.QualificationExaminationType;
import java.time.LocalDate;

public interface ClerkQualificationDTOCommonFields {
  LanguagePairDTO languagePair();

  LocalDate beginDate();

  LocalDate endDate();

  QualificationExaminationType examinationType();

  Boolean permissionToPublish();

  String diaryNumber();
}
