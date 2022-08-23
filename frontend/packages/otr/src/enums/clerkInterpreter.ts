export enum QualificationStatus {
  Effective = 'effective',
  Expired = 'expired',
  Expiring = 'expiring',
}

export enum ClerkInterpreterTextFieldEnum {
  IdentityNumber = 'identityNumber',
  LastName = 'lastName',
  FirstName = 'firstName',
  NickName = 'nickName',
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  OtherContactInfo = 'otherContactInfo',
  Street = 'street',
  PostalCode = 'postalCode',
  Town = 'town',
  Country = 'country',
  ExtraInformation = 'extraInformation',
}

export enum ClerkInterpreterToggleableFieldEnum {
  PermissionToPublishEmail = 'permissionToPublishEmail',
  PermissionToPublishPhone = 'permissionToPublishPhone',
  PermissionToPublishOtherContactInfo = 'permissionToPublishOtherContactInfo',
}

export enum AreaOfOperation {
  All = 'all',
  Regions = 'regions',
}
