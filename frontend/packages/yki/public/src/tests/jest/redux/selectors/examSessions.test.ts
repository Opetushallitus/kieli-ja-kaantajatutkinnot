import dayjs from 'dayjs';

import type { RootState } from 'configs/redux';
import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import {
  ExamSession,
  ExamSessionFilters,
  ExamSessionLocation,
} from 'interfaces/examSessions';
import { selectFilteredPublicExamSessions } from 'redux/selectors/examSessions';

const location: Array<ExamSessionLocation> = [
  {
    name: 'Jälkiedu',
    post_office: 'Tampere',
    zip: '00100',
    street_address: 'Jokukatu 4',
    other_location_info: 'auditorio A2',
    extra_information: '',
    lang: 'fi',
  },
];

const baseFields = {
  session_date: dayjs('2099-12-31'),
  language_code: ExamLanguage.FIN,
  level_code: ExamLevel.YLIN,
  start_time_read_listen: null,
  start_time_speak_write: null,
  max_participants: 10,
  max_participants_read_listen: 5,
  max_participants_speak_write: 5,
  participants: 0,
  participants_read_listen: 0,
  participants_speak_write: 0,
  published_at: '',
  location,
  exam_fee: 100,
  available_registration_kind: RegistrationKind.Admission,
  registration_start_date: dayjs('2020-01-01'),
  registration_end_date: dayjs('2090-06-15'),
  open: true,
  queue: 0,
  upcoming_admission: true,
};

const fullSession: ExamSession = {
  ...baseFields,
  id: 1,
  type: 'FULL',
  partial_registration_kind: { ALL_PARTS: RegistrationKind.Admission },
};

const readSpeakSession: ExamSession = {
  ...baseFields,
  id: 2,
  type: 'READ_SPEAK',
  partial_registration_kind: {
    ALL_PARTS: RegistrationKind.Admission,
    READ: RegistrationKind.Admission,
    SPEAK: RegistrationKind.Admission,
  },
};

const listenWriteSession: ExamSession = {
  ...baseFields,
  id: 3,
  type: 'LISTEN_WRITE',
  partial_registration_kind: {
    ALL_PARTS: RegistrationKind.Admission,
    LISTEN: RegistrationKind.Admission,
    WRITE: RegistrationKind.Admission,
  },
};

const allSessions = [fullSession, readSpeakSession, listenWriteSession];

const filterByPartialTypes = (
  selectedPartialExamTypes: ExamSessionFilters['selectedPartialExamTypes'],
) =>
  selectFilteredPublicExamSessions({
    examSessions: {
      exam_sessions: allSessions,
      filters: {
        excludeFullSessions: false,
        excludeNonOpenSessions: false,
        selectedPartialExamTypes,
      },
    },
  } as unknown as RootState).map((es) => es.id);

describe('selectFilteredPublicExamSessions', () => {
  it('should return all sessions when no partial exam type is selected', () => {
    expect(filterByPartialTypes([])).toEqual([1, 2, 3]);
  });

  it('should include FULL and READ_SPEAK sessions when a READ_SPEAK part is selected', () => {
    expect(filterByPartialTypes(['READ'])).toEqual([1, 2]);
    expect(filterByPartialTypes(['SPEAK'])).toEqual([1, 2]);
  });

  it('should include FULL and LISTEN_WRITE sessions when a LISTEN_WRITE part is selected', () => {
    expect(filterByPartialTypes(['LISTEN'])).toEqual([1, 3]);
    expect(filterByPartialTypes(['WRITE'])).toEqual([1, 3]);
  });

  it('should union the allowed session types across multiple selected parts', () => {
    expect(filterByPartialTypes(['READ', 'LISTEN'])).toEqual([1, 2, 3]);
  });

  it('should show only FULL sessions when only ALL_PARTS is selected', () => {
    expect(filterByPartialTypes(['ALL_PARTS'])).toEqual([1]);
  });
});
