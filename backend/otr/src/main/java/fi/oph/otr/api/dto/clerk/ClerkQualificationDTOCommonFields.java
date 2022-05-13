package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.QualificationExaminationType;
import java.util.List;

public interface ClerkQualificationDTOCommonFields {
  QualificationExaminationType examinationType();

  Boolean permissionToPublish();

  List<ClerkLanguagePairDTO> languages();
}
