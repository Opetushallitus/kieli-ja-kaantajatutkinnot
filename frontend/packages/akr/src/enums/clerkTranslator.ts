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

export enum ClerkTranslatorAddressSource {
  AKR = 'alkupera8',
  VTJ = 'alkupera1',
}

export enum ClerkTranslatorAddressFieldEnum {
  Street = 'street',
  PostalCode = 'postalCode',
  Town = 'town',
  Country = 'country',
}

export enum ClerkTranslatorTextFieldEnum {
  FirstName = 'firstName',
  LastName = 'lastName',
  NickName = 'nickName',
  IdentityNumber = 'identityNumber',
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  ExtraInformation = 'extraInformation',
}

export enum TranslatorEmailStatus {
  Exists = 'exists',
  Missing = 'missing',
}
