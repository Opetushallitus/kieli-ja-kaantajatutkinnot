package fi.oph.otr.util;

import java.util.List;

public record LegalInterpreterData(
  boolean permissionToPublishEmail,
  boolean permissionToPublishPhone,
  String otherContactInfo,
  boolean permissionToPublishOtherContactInfo,
  String extraInformation,
  List<LocationData> areas
) {}
