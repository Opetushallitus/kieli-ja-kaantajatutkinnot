export enum APIEndpoints {
  PublicInterpreter = '/otr/api/v1/interpreter',
  ClerkInterpreter = '/otr/api/v1/clerk/interpreter',
  ClerkUser = '/otr/api/v1/clerk/user',
  Qualification = '/otr/api/v1/clerk/interpreter/qualification',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {}
