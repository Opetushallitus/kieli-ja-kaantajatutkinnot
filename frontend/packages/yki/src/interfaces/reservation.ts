export interface ReservationRequest {
  email: string;
  examSessionId: number;
}

export interface ReservationErrorResponse {
  exists: boolean;
  full: boolean;
}

export enum ReservationErrorCause {
  EmailAlreadyQueued = 'emailAlreadyQueued',
  FullQueue = 'fullQueue',
  Unknown = 'unknown',
}
