import { RegistrationStates } from 'enums/app';
import { PublicRegistrationInitResponse as LegacyInitResponse } from 'interfaces/publicRegistration';
import { SessionResponse } from 'interfaces/session';

// The same response contract is used by init and every registration step GET.
export interface PublicRegistrationInitResponse extends LegacyInitResponse {
  state: RegistrationStates;
  session: SessionResponse;
  reservation_expires_at: string | null;
  is_free: boolean;
  authentication_urls: { suomifi: string; email: string };
  payment: {
    url: string;
    due_date: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
  } | null;
}
export type RegistrationStep = 'Identify' | 'Register' | 'Payment' | 'Done';
export interface RegistrationKey {
  examSessionId: number;
  registrationId: number;
}
