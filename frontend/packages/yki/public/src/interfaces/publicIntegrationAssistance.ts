import { APIResponseStatus } from 'shared/enums';

export type IntegrationAssistanceDecision =
  | 'FREE'
  | 'NOT_ELIGIBLE'
  | 'ALREADY_USED'
  | 'UNAVAILABLE';

export interface PublicIntegrationAssistanceResponse {
  decision: IntegrationAssistanceDecision;
  freeRegistrationId?: number;
}

export interface PublicIntegrationAssistanceState {
  status: APIResponseStatus;
  registrationId?: number;
  decision?: IntegrationAssistanceDecision;
}
