export enum APIEndpoints {
  PublicTranslator = '/api/v1/translator',
  ClerkTranslator = '/api/v1/clerk/translator',
  ContactRequest = '/api/v1/translator/contact-request',
}

export enum APIResponseStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Error = 'ERROR',
}
