package fi.oph.otr.api.dto.clerk;

import java.util.List;

public interface ClerkLegalInterpreterDTOCommonFields {
  ClerkLegalInterpreterExaminationTypeDTO examinationType();

  Boolean permissionToPublishEmail();

  Boolean permissionToPublishPhone();

  Boolean permissionToPublishOtherContactInfo();

  Boolean permissionToPublish();

  String otherContactInfo();

  String extraInformation();

  List<String> areas();

  List<ClerkLanguagePairDTO> languages();
}
