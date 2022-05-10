package fi.oph.otr.api.dto.clerk;

import java.util.List;

public interface ClerkLegalInterpreterDTOCommonFields {
  ClerkLegalInterpreterExaminationTypeDTO examinationType();

  Boolean permissionToPublish();

  List<ClerkLanguagePairDTO> languages();
}
