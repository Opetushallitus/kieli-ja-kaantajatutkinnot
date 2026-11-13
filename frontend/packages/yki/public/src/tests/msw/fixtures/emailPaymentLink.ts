import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';
import { RegistrationDetailsResponse } from 'interfaces/publicRegistration';

export const emailPaymentRegistration: RegistrationDetailsResponse = {
  id: 191918,
  kind: RegistrationKind.Admission,
  partial_exam_type: 'LISTEN',
  exam_session_id: 188,
};

// The confirmation endpoint does not return the session type or start times.
// Its fee is the full-exam fee, even for this listening-only registration.
export const emailPaymentConfirmation = {
  id: 191918,
  level_code: ExamLevel.KESKI,
  language_code: ExamLanguage.ENG,
  expires_at: '2026-11-13T22:00:00.000Z',
  session_date: '2026-12-24',
  exam_fee: 190,
  registration_start_date: '2026-07-02',
  registration_end_date: '2026-12-20',
  location: [
    {
      name: 'Test institution',
      street_address: 'Testikatu 1',
      post_office: 'Helsinki',
      zip: '00100',
      other_location_info: '',
      lang: 'fi' as const,
    },
  ],
};

export const emailPaymentExamSession: ExamSessionResponse = {
  ...emailPaymentConfirmation,
  id: 188,
  type: 'LISTEN_WRITE',
  start_time_read_listen: '09:00',
  start_time_speak_write: '13:00',
  max_participants: 20,
  max_participants_read_listen: 20,
  max_participants_speak_write: 20,
  participants: 10,
  participants_read_listen: 10,
  participants_speak_write: 10,
  published_at: '2026-06-01T00:00:00Z',
  available_registration_kind: RegistrationKind.Admission,
  partial_registration_kind: {
    ALL_PARTS: RegistrationKind.Admission,
    LISTEN: RegistrationKind.Admission,
    WRITE: RegistrationKind.Admission,
  },
};
