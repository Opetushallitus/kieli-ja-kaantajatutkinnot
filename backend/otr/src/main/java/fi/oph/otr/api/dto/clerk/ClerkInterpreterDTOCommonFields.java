package fi.oph.otr.api.dto.clerk;

import java.util.List;

public interface ClerkInterpreterDTOCommonFields {
  String identityNumber();

  String firstName();

  String nickName();

  String lastName();

  String email();

  Boolean permissionToPublishEmail();

  String phoneNumber();

  Boolean permissionToPublishPhone();

  String otherContactInfo();

  Boolean permissionToPublishOtherContactInfo();

  String street();

  String postalCode();

  String town();

  String extraInformation();

  List<String> areas();
}
