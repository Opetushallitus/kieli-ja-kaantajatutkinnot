package fi.oph.akr.api.dto.clerk.modify;

public interface TranslatorDTOCommonFields {
  Boolean isIndividualised();

  Boolean hasIndividualisedAddress();

  String identityNumber();

  String firstName();

  String lastName();

  String nickName();

  String email();

  String phoneNumber();

  String street();

  String postalCode();

  String town();

  String country();

  String extraInformation();

  Boolean isAssuranceGiven();
}
