import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ClerkExamSessionResponse } from 'interfaces/clerkExamSession';

export const clerkExamSession: ClerkExamSessionResponse = {
  level_code: ExamLevel.YLIN,
  language_code: ExamLanguage.FIN,
  open: true,
  upcoming_admission: true,
  participants: 15,
  max_participants: 15,
  queue: 0,
  contact: [
    {
      email: 'contact.person@testi.invalid',
    },
  ],
  office_oid: '1.2.246.562.10.29461948951',
  published_at: '2019-01-15T11:16:37.959Z',
  session_date: '2035-01-01',
  organizer_oid: '1.2.246.562.10.28646781493',
  id: 999,
  registration_start_date: '2023-01-01',
  location: [
    {
      lang: 'fi',
      extra_information: '',
      name: 'Jälkiedu',
      other_location_info: 'auditorio A2',
      street_address: 'Jokukatu 4',
      post_office: 'Tampere',
      zip: '00100',
    },
    {
      lang: 'sv',
      extra_information: '',
      name: 'Jälkiedu',
      other_location_info: 'auditorium A2',
      street_address: 'Jokukatu 4',
      post_office: 'Tammerfors',
      zip: '00100',
    },
    {
      lang: 'en',
      extra_information: '',
      name: 'Jälkiedu',
      other_location_info: 'auditorium A2',
      street_address: 'Jokukatu 4',
      post_office: 'Tampere',
      zip: '00100',
    },
  ],
  exam_fee: 200,
  registration_end_date: '2030-12-31',
  available_registration_kind: RegistrationKind.Admission,
};
