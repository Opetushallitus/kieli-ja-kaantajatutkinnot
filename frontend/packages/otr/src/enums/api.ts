export enum APIEndpoints {
  PublicInterpreter = '/otr/api/v1/interpreter',
  ClerkInterpreter = '/otr/api/v1/clerk/interpreter',
  ClerkMissingInterpreters = '/otr/api/v1/clerk/interpreter/missing',
  ClerkPersonSearch = '/otr/api/v1/clerk/person',
  ClerkUser = '/otr/api/v1/clerk/user',
  Qualification = '/otr/api/v1/clerk/interpreter/qualification',
  MeetingDate = '/otr/api/v1/clerk/meetingDate',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {
  InterpreterOnrIdAndIndividualisedMismatch = 'interpreterOnrIdAndIndividualisedMismatch',
  InterpreterRegionUnknown = 'interpreterRegionUnknown',
  InvalidVersion = 'invalidVersion',
  MeetingDateCreateDuplicateDate = 'meetingDateCreateDuplicateDate',
  MeetingDateDeleteHasQualifications = 'meetingDateDeleteHasQualifications',
  MeetingDateUpdateDuplicateDate = 'meetingDateUpdateDuplicateDate',
  MeetingDateUpdateHasQualifications = 'meetingDateUpdateHasQualifications',
  OnrSaveException = 'onrSaveException',
  QualificationDeleteLastQualification = 'qualificationDeleteLastQualification',
  QualificationInvalidTerm = 'qualificationInvalidTerm',
  QualificationLanguageUnknown = 'qualificationLanguageUnknown',
  QualificationMissingMeetingDate = 'qualificationMissingMeetingDate',
}
