package fi.oph.otr.api.dto.clerk;

import java.util.List;

public interface ClerkInterpreterDTOCommonFields {
  Boolean isIndividualised();

  Boolean hasIndividualisedAddress();

  String identityNumber();

  String lastName();

  String firstName();

  String nickName();

  String email();

  Boolean permissionToPublishEmail();

  String phoneNumber();

  Boolean permissionToPublishPhone();

  String otherContactInfo();

  Boolean permissionToPublishOtherContactInfo();

  String street();

  String postalCode();

  String town();

  String country();

  String extraInformation();

  List<String> regions();
}
