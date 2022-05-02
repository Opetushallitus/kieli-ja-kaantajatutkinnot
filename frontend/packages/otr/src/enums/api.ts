export enum APIEndpoints {
  PublicInterpreter = '/otr/api/v1/interpreter',
}

export enum APIResponseStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Error = 'ERROR',
  Cancelled = 'CANCELLED',
}

/**
 * Certain errors expected to be returned by the backend.
 * The respective backend enum is `APIExceptionType`.
 */
export enum APIError {}
