export enum AuthorisationStatus {
  // TODO Are these proper enums?
  // An authorisation could simultaneously be thought of as 'Authorised' and 'Expiring'.
  // Furthermore, the translator listing is about translations, not authorisations ..
  Authorised = 'authorised',
  Expiring = 'expiring',
  Expired = 'expired',
}
