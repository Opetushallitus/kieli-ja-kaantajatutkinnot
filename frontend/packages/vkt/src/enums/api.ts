export enum APIEndpoints {
  PublicExamEvent = '/vkt/api/v1/examEvent',
  ClerkExamEvent = '/vkt/api/v1/clerk/examEvent',
  ClerkUser = '/vkt/api/v1/clerk/user',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
// ts-unused-exports:disable-next-line
export enum APIError {
  InvalidVersion = 'invalidVersion',
}
