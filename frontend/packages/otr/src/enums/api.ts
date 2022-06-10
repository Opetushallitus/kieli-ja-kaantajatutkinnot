export enum APIEndpoints {
  PublicInterpreter = '/otr/api/v1/interpreter',
  ClerkInterpreter = '/otr/api/v1/clerk/interpreter',
  Qualification = '/otr/api/v1/clerk/interpreter/qualification',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {}
