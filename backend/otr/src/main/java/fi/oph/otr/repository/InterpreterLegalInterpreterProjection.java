package fi.oph.otr.repository;

public record InterpreterLegalInterpreterProjection(
  long interpreterId,
  boolean permissionToPublishEmail,
  boolean permissionToPublishPhone,
  boolean permissionToPublishOtherContactInfo,
  String otherContactInfo
) {}
