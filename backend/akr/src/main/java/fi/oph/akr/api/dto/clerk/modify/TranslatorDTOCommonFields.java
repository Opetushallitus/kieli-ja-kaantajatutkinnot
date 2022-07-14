package fi.oph.akr.api.dto.clerk.modify;

public interface TranslatorDTOCommonFields {
  String firstName();

  String lastName();

  String identityNumber();

  String email();

  String phoneNumber();

  String street();

  String postalCode();

  String town();

  String country();

  String extraInformation();

  Boolean isAssuranceGiven();
}
