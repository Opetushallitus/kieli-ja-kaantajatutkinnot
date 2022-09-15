export enum AuthorisationStatus {
  Effective = 'effective',
  Expiring = 'expiring',
  Expired = 'expired',
  ExpiredDeduplicated = 'expiredDeduplicated',
  FormerVir = 'formerVir',
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
  ExtraInformation = 'extraInformation',
}
