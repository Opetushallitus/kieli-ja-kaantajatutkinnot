export enum AuthorisationStatus {
  // TODO Are these proper enums?
  // An authorisation could simultaneously be thought of as 'Authorised' and 'Expiring'.
  // Furthermore, the translator listing is about translations, not authorisations ..
  Authorised = 'authorised',
  Expiring = 'expiring',
  Expired = 'expired',
  FormerVIR = 'formerVIR',
}

export enum AuthorisationBasisEnum {
  AUT = 'AUT',
  KKT = 'KKT',
  VIR = 'VIR',
}

export enum ClerkTranslatorTextFieldEnum {
  FirstName = 'firstName',
  LastName = 'lastName',
  IdentityNumber = 'identityNumber',
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  Street = 'street',
  PostalCode = 'postalCode',
  Town = 'town',
  Country = 'country',
  ExtraInformation = 'extraInformation',
}
