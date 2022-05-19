package fi.oph.otr.api.dto.clerk;

import java.util.List;

public interface ClerkInterpreterDTOCommonFields {
  String identityNumber();

  String firstName();

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

  String country();

  String extraInformation();

  List<String> regions();
}
