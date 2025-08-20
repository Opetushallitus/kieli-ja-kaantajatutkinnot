import { ExamSession } from 'interfaces/examSessions';

type TransferEnrollmentCommon = Pick<
  ExamSession,
  'id' | 'session_date' | 'language_code' | 'level_code' | 'location'
>;

export type TransferEnrollmentTarget = TransferEnrollmentCommon &
  Pick<ExamSession, 'participants' | 'max_participants'>;

export interface TransferEnrollmentTargetResponse
  extends Omit<TransferEnrollmentTarget, 'session_date'> {
  session_date: string;
}

export interface TransferEnrollmentDetails extends TransferEnrollmentCommon {
  is_transferable: boolean;
  contact_email: string;
  targets: Array<TransferEnrollmentTarget>;
}

export interface TransferEnrollmentDetailsResponse
  extends Omit<TransferEnrollmentDetails, 'session_date' | 'targets'> {
  session_date: string;
  targets: Array<TransferEnrollmentTargetResponse>;
}

export interface RelocateRequest {
  registration_id: number;
  to_exam_session_id: number;
}

export interface RelocateResponse {
  success: boolean;
}
