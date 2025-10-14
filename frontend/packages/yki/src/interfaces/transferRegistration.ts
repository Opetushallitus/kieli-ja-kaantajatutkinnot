import { ExamSession } from 'interfaces/examSessions';

type TransferRegistrationCommon = Pick<
  ExamSession,
  'id' | 'session_date' | 'language_code' | 'level_code' | 'location'
>;

export type TransferRegistrationTarget = TransferRegistrationCommon &
  Pick<ExamSession, 'participants' | 'max_participants'>;

export interface TransferRegistrationTargetResponse
  extends Omit<TransferRegistrationTarget, 'session_date'> {
  session_date: string;
}

export interface TransferRegistrationDetails
  extends TransferRegistrationCommon {
  is_transferable: boolean;
  contact_email: string;
  targets: Array<TransferRegistrationTarget>;
}

export interface TransferRegistrationDetailsResponse
  extends Omit<TransferRegistrationDetails, 'session_date' | 'targets'> {
  session_date: string;
  targets: Array<TransferRegistrationTargetResponse>;
}

export interface RelocateRequest {
  registration_id: number;
  to_exam_session_id: number;
}

export interface RelocateResponse {
  success: boolean;
}
