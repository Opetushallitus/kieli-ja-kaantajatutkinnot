import { ExamSession } from 'interfaces/examSessions';

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
>;

export interface RegistrationToConfirmDetailsResponse
  extends Omit<
    RegistrationToConfirmDetails,
    'session_date' | 'registration_start_date' | 'registration_end_date'
  > {
  session_date: string;
  registration_start_date: string;
  registration_end_date: string;
}
