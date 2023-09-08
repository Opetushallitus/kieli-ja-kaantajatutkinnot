export enum APIEndpoints {
  PublicTranslator = '/akr/api/v1/translator',
  ClerkPersonSearch = '/akr/api/v1/clerk/person',
  ClerkTranslator = '/akr/api/v1/clerk/translator',
  ContactRequest = '/akr/api/v1/translator/contact-request',
  Authorisation = '/akr/api/v1/clerk/translator/authorisation',
  InformalClerkTranslatorEmail = '/akr/api/v1/clerk/email/informal',
  ClerkUser = '/akr/api/v1/clerk/user',
  ExaminationDate = '/akr/api/v1/clerk/examinationDate',
  MeetingDate = '/akr/api/v1/clerk/meetingDate',
  StatisticsContactRequestsYearly = '/akr/api/v1/clerk/statistics/contact-requests/yearly',
  StatisticsContactRequestsMonthly = '/akr/api/v1/clerk/statistics/contact-requests/monthly',
  StatisticsContactRequestsDaily = '/akr/api/v1/clerk/statistics/contact-requests/daily',
  StatisticsEmailsYearly = '/akr/api/v1/clerk/statistics/emails/yearly',
  StatisticsEmailsMonthly = '/akr/api/v1/clerk/statistics/emails/monthly',
  StatisticsEmailsDaily = '/akr/api/v1/clerk/statistics/emails/daily',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  AuthorisationBasisAndExaminationDateMismatch = 'authorisationBasisAndExaminationDateMismatch',
  AuthorisationBasisAndTermEndDateMismatch = 'authorisationBasisAndTermEndDateMismatch',
  AuthorisationDeleteLastAuthorisation = 'authorisationDeleteLastAuthorisation',
  AuthorisationMissingExaminationDate = 'authorisationMissingExaminationDate',
  AuthorisationMissingMeetingDate = 'authorisationMissingMeetingDate',
  ExaminationDateCreateDuplicateDate = 'examinationDateCreateDuplicateDate',
  ExaminationDateDeleteHasAuthorisations = 'examinationDateDeleteHasAuthorisations',
  InvalidVersion = 'invalidVersion',
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
