import { Dayjs } from 'dayjs';

import { ExamSession } from 'interfaces/examSessions';

export interface PaymentDetails {
  due_date: Dayjs;
  payment_url: string;
}

export type RegistrationToConfirmDetails = Pick<
  ExamSession,
  | 'id'
  | 'session_date'
  | 'language_code'
  | 'level_code'
  | 'location'
  | 'registration_start_date'
  | 'registration_end_date'
  | 'exam_fee'
> &
  PaymentDetails;

export interface RegistrationToConfirmDetailsResponse
  extends Omit<
    RegistrationToConfirmDetails,
    | 'session_date'
    | 'registration_start_date'
    | 'registration_end_date'
    | 'due_date'
  > {
  session_date: string;
  registration_start_date: string;
  registration_end_date: string;
  expires_at: string;
}
