export enum APIEndpoints {
  PublicTranslator = '/akt/api/v1/translator',
  ClerkTranslator = '/akt/api/v1/clerk/translator',
  ContactRequest = '/akt/api/v1/translator/contact-request',
  Authorisation = '/akt/api/v1/clerk/translator/authorisation',
  AuthorisationPublishPermission = '/akt/api/v1/clerk/translator/authorisation/publishPermission',
  InformalClerkTranslatorEmail = '/akt/api/v1/clerk/email/informal',
  ClerkUser = '/akt/api/v1/clerk/user',
  ExaminationDate = '/akt/api/v1/clerk/examinationDate',
  MeetingDate = '/akt/api/v1/clerk/meetingDate',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  AuthorisationBasisAndExaminationDateMismatch = 'authorisationBasisAndExaminationDateMismatch',
  AuthorisationDeleteLastAuthorisation = 'authorisationDeleteLastAuthorisation',
  AuthorisationMissingExaminationDate = 'authorisationMissingExaminationDate',
  AuthorisationMissingMeetingDate = 'authorisationMissingMeetingDate',
  ExaminationDateCreateDuplicateDate = 'examinationDateCreateDuplicateDate',
  ExaminationDateDeleteHasAuthorisations = 'examinationDateDeleteHasAuthorisations',
  MeetingDateCreateDuplicateDate = 'meetingDateCreateDuplicateDate',
  MeetingDateDeleteHasAuthorisations = 'meetingDateDeleteHasAuthorisations',
  MeetingDateUpdateDuplicateDate = 'meetingDateUpdateDuplicateDate',
  MeetingDateUpdateHasAuthorisations = 'meetingDateUpdateHasAuthorisations',
  TranslatorCreateDuplicateEmail = 'translatorCreateDuplicateEmail',
  TranslatorCreateDuplicateIdentityNumber = 'translatorCreateDuplicateIdentityNumber',
  TranslatorCreateUnknownCountry = 'translatorCreateUnknownCountry',
  TranslatorUpdateDuplicateEmail = 'translatorUpdateDuplicateEmail',
  TranslatorUpdateDuplicateIdentityNumber = 'translatorUpdateDuplicateIdentityNumber',
  TranslatorUpdateUnknownCountry = 'translatorUpdateUnknownCountry',
}
