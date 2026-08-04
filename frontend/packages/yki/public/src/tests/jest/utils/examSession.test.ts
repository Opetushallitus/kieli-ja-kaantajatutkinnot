import dayjs from 'dayjs';

import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';
import { PersonRegistrations } from 'interfaces/userDetails';
import { ExamSessionUtils } from 'utils/examSession';

const expectEffectiveRegistrationDetails = (
  es: ExamSession,
  expected: Partial<
    ReturnType<typeof ExamSessionUtils.getEffectiveRegistrationPeriodDetails>
  >,
) => {
  const actual = ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
  const expectedKeys = Object.keys(expected);
  const actualSubset = Object.fromEntries(
    expectedKeys.map((k) => [k, actual[k as keyof typeof expected]]),
  );
  expect(expected).toEqual(actualSubset);
};

describe('ExamSessionUtils', () => {
  const baseExamSession: ExamSession = {
    id: 1,
    type: 'FULL',
    session_date: dayjs('2099-31-12'),
    language_code: ExamLanguage.ENG,
    level_code: ExamLevel.KESKI,
    max_participants: 13,
    published_at: '',
    location: [
      {
        name: 'Jälkiedu',
        post_office: 'Tampere',
        zip: '00100',
        street_address: 'Jokukatu 4',
        other_location_info: 'auditorio A2',
        extra_information: '',
        lang: 'fi',
      },
    ] as Array<ExamSessionLocation>,
    exam_fee: 100.0,
    open: true,
    queue: 0,
    participants: 7,
    registration_start_date: dayjs('2020-01-01'),
    registration_end_date: dayjs('2090-06-15'),
    upcoming_admission: true,
    available_registration_kind: RegistrationKind.Admission,
    partial_registration_kind: { ALL_PARTS: RegistrationKind.Admission },
    start_time_read_listen: null,
    start_time_speak_write: null,
    max_participants_read_listen: null,
    max_participants_speak_write: null,
    participants_read_listen: null,
    participants_speak_write: null,
  };

  const readSpeakExamSession: ExamSession = {
    ...baseExamSession,
    type: 'READ_SPEAK',
    partial_registration_kind: {
      ALL_PARTS: RegistrationKind.Admission,
      READ: RegistrationKind.Admission,
      SPEAK: RegistrationKind.Queue,
    },
    max_participants_read_listen: 5,
    max_participants_speak_write: 5,
    participants_read_listen: 2,
    participants_speak_write: 4,
  };

  const listenWriteExamSession: ExamSession = {
    ...baseExamSession,
    type: 'LISTEN_WRITE',
    partial_registration_kind: {
      ALL_PARTS: RegistrationKind.Admission,
      LISTEN: RegistrationKind.Queue,
      WRITE: RegistrationKind.Admission,
    },
    max_participants_read_listen: 5,
    max_participants_speak_write: 5,
    participants_read_listen: 2,
    participants_speak_write: 4,
  };

  describe('getPartialExamFee', () => {
    it('should return an empty string when no partial exam type is selected', () => {
      expect(ExamSessionUtils.getPartialExamFee(baseExamSession)).toEqual('');
      expect(ExamSessionUtils.getPartialExamFee(readSpeakExamSession)).toEqual(
        '',
      );
    });

    it('should return the full exam fee for FULL sessions', () => {
      expect(
        ExamSessionUtils.getPartialExamFee(baseExamSession, 'ALL_PARTS'),
      ).toEqual(baseExamSession.exam_fee);
    });

    it('should return the correct fee for each READ_SPEAK partial exam type', () => {
      expect(
        ExamSessionUtils.getPartialExamFee(readSpeakExamSession, 'ALL_PARTS'),
      ).toEqual(127);
      expect(
        ExamSessionUtils.getPartialExamFee(readSpeakExamSession, 'READ'),
      ).toEqual(43);
      expect(
        ExamSessionUtils.getPartialExamFee(readSpeakExamSession, 'SPEAK'),
      ).toEqual(84);
    });

    it('should return the correct fee for each LISTEN_WRITE partial exam type', () => {
      expect(
        ExamSessionUtils.getPartialExamFee(listenWriteExamSession, 'ALL_PARTS'),
      ).toEqual(113);
      expect(
        ExamSessionUtils.getPartialExamFee(listenWriteExamSession, 'LISTEN'),
      ).toEqual(43);
      expect(
        ExamSessionUtils.getPartialExamFee(listenWriteExamSession, 'WRITE'),
      ).toEqual(70);
    });
  });

  describe('getRegistrationKind', () => {
    it('should return the session available registration kind when no partial exam type is selected', () => {
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: readSpeakExamSession,
        }),
      ).toEqual(readSpeakExamSession.available_registration_kind);
    });

    it('should resolve the registration kind per READ_SPEAK partial exam type', () => {
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: readSpeakExamSession,
          partialExamType: 'READ',
        }),
      ).toEqual(RegistrationKind.Admission);
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: readSpeakExamSession,
          partialExamType: 'SPEAK',
        }),
      ).toEqual(RegistrationKind.Queue);
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: readSpeakExamSession,
          partialExamType: 'ALL_PARTS',
        }),
      ).toEqual(RegistrationKind.Admission);
    });

    it('should resolve the registration kind per LISTEN_WRITE partial exam type', () => {
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: listenWriteExamSession,
          partialExamType: 'LISTEN',
        }),
      ).toEqual(RegistrationKind.Queue);
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: listenWriteExamSession,
          partialExamType: 'WRITE',
        }),
      ).toEqual(RegistrationKind.Admission);
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: listenWriteExamSession,
          partialExamType: 'ALL_PARTS',
        }),
      ).toEqual(RegistrationKind.Admission);
    });
  });

  describe('queue registration for a full part', () => {
    it('uses the queue registration kind for a part whose quota is full', () => {
      const readSpeakSpeakFull: ExamSession = {
        ...readSpeakExamSession,
        participants_speak_write:
          readSpeakExamSession.max_participants_speak_write ?? 0,
      };

      // SPEAK quota is full, so no admission places remain for that part...
      expect(
        ExamSessionUtils.getAvailablePlaces(readSpeakSpeakFull, 'SPEAK'),
      ).toEqual(0);
      // ...but queueing is allowed, so the part resolves to the queue kind.
      expect(
        ExamSessionUtils.getRegistrationKind({
          examSession: readSpeakSpeakFull,
          partialExamType: 'SPEAK',
        }),
      ).toEqual(RegistrationKind.Queue);
    });
  });

  describe('getAvailablePlaces', () => {
    it('should draw from the read/listen quota for READ and LISTEN parts', () => {
      expect(
        ExamSessionUtils.getAvailablePlaces(readSpeakExamSession, 'READ'),
      ).toEqual(3);
      expect(
        ExamSessionUtils.getAvailablePlaces(listenWriteExamSession, 'LISTEN'),
      ).toEqual(3);
    });

    it('should draw from the speak/write quota for SPEAK, WRITE and ALL_PARTS parts', () => {
      expect(
        ExamSessionUtils.getAvailablePlaces(readSpeakExamSession, 'SPEAK'),
      ).toEqual(1);
      expect(
        ExamSessionUtils.getAvailablePlaces(readSpeakExamSession, 'ALL_PARTS'),
      ).toEqual(1);
      expect(
        ExamSessionUtils.getAvailablePlaces(listenWriteExamSession, 'WRITE'),
      ).toEqual(1);
      expect(
        ExamSessionUtils.getAvailablePlaces(
          listenWriteExamSession,
          'ALL_PARTS',
        ),
      ).toEqual(1);
    });

    it('should never return a negative number of available places', () => {
      const overbooked: ExamSession = {
        ...readSpeakExamSession,
        participants_read_listen: 10,
        participants_speak_write: 10,
      };
      expect(ExamSessionUtils.getAvailablePlaces(overbooked, 'READ')).toEqual(
        0,
      );
      expect(ExamSessionUtils.getAvailablePlaces(overbooked, 'SPEAK')).toEqual(
        0,
      );
    });

    it('should return no available places when admission is not upcoming', () => {
      expect(
        ExamSessionUtils.getAvailablePlaces(
          { ...readSpeakExamSession, upcoming_admission: false },
          'READ',
        ),
      ).toEqual(0);
    });

    it('should return no available places when the session is a queue', () => {
      expect(
        ExamSessionUtils.getAvailablePlaces(
          { ...readSpeakExamSession, queue: 1 },
          'READ',
        ),
      ).toEqual(0);
    });
  });

  describe('getStartTime', () => {
    const readSpeak: ExamSession = {
      ...readSpeakExamSession,
      start_time_read_listen: '09:00',
      start_time_speak_write: '13:00',
    };
    const listenWrite: ExamSession = {
      ...listenWriteExamSession,
      start_time_read_listen: '08:00',
      start_time_speak_write: '12:00',
    };

    it('should return an empty string when no partial exam type is selected', () => {
      expect(ExamSessionUtils.getStartTime(readSpeak)).toEqual('');
    });

    it('should map READ_SPEAK parts to the correct start time', () => {
      expect(ExamSessionUtils.getStartTime(readSpeak, 'READ')).toEqual('09:00');
      expect(ExamSessionUtils.getStartTime(readSpeak, 'SPEAK')).toEqual(
        '13:00',
      );
      expect(ExamSessionUtils.getStartTime(readSpeak, 'ALL_PARTS')).toEqual(
        '09:00',
      );
    });

    it('should map LISTEN_WRITE parts to the correct start time', () => {
      expect(ExamSessionUtils.getStartTime(listenWrite, 'LISTEN')).toEqual(
        '08:00',
      );
      expect(ExamSessionUtils.getStartTime(listenWrite, 'WRITE')).toEqual(
        '12:00',
      );
      expect(ExamSessionUtils.getStartTime(listenWrite, 'ALL_PARTS')).toEqual(
        '08:00',
      );
    });

    it('should return undefined for FULL sessions', () => {
      expect(
        ExamSessionUtils.getStartTime(baseExamSession, 'ALL_PARTS'),
      ).toBeUndefined();
    });
  });

  describe('getStartTimeForPersonRegistrations', () => {
    const personRegistration = (
      overrides: Partial<PersonRegistrations>,
    ): PersonRegistrations => overrides as PersonRegistrations;

    const readSpeak = {
      type: 'READ_SPEAK' as const,
      start_time_read_listen: '09:00',
      start_time_speak_write: '13:00',
    };
    const listenWrite = {
      type: 'LISTEN_WRITE' as const,
      start_time_read_listen: '08:00',
      start_time_speak_write: '12:00',
    };

    it('should return an empty string when no partial exam type is selected', () => {
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration(readSpeak),
        ),
      ).toEqual('');
    });

    it('should map READ_SPEAK parts to the correct start time', () => {
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...readSpeak, partialExamType: 'READ' }),
        ),
      ).toEqual('09:00');
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...readSpeak, partialExamType: 'SPEAK' }),
        ),
      ).toEqual('13:00');
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...readSpeak, partialExamType: 'ALL_PARTS' }),
        ),
      ).toEqual('09:00');
    });

    it('should map LISTEN_WRITE parts to the correct start time', () => {
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...listenWrite, partialExamType: 'LISTEN' }),
        ),
      ).toEqual('08:00');
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...listenWrite, partialExamType: 'WRITE' }),
        ),
      ).toEqual('12:00');
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ ...listenWrite, partialExamType: 'ALL_PARTS' }),
        ),
      ).toEqual('08:00');
    });

    it('should return undefined for FULL registrations', () => {
      expect(
        ExamSessionUtils.getStartTimeForPersonRegistrations(
          personRegistration({ type: 'FULL', partialExamType: 'ALL_PARTS' }),
        ),
      ).toBeUndefined();
    });
  });

  describe('getPartialExamTypeText', () => {
    const keyPrefix = 'yki.component.registration.examSessionCard.examType';

    it('should return an empty string when no partial exam type is selected', () => {
      expect(ExamSessionUtils.getPartialExamTypeText('READ_SPEAK')).toEqual('');
    });

    it('should return the full exam type key for FULL sessions', () => {
      expect(
        ExamSessionUtils.getPartialExamTypeText('FULL', 'ALL_PARTS'),
      ).toEqual(`${keyPrefix}.full`);
    });

    it('should map READ_SPEAK parts to the correct i18n key', () => {
      expect(
        ExamSessionUtils.getPartialExamTypeText('READ_SPEAK', 'ALL_PARTS'),
      ).toEqual(`${keyPrefix}.readSpeak`);
      expect(
        ExamSessionUtils.getPartialExamTypeText('READ_SPEAK', 'READ'),
      ).toEqual(`${keyPrefix}.read`);
      expect(
        ExamSessionUtils.getPartialExamTypeText('READ_SPEAK', 'SPEAK'),
      ).toEqual(`${keyPrefix}.speak`);
    });

    it('should map LISTEN_WRITE parts to the correct i18n key', () => {
      expect(
        ExamSessionUtils.getPartialExamTypeText('LISTEN_WRITE', 'ALL_PARTS'),
      ).toEqual(`${keyPrefix}.listenWrite`);
      expect(
        ExamSessionUtils.getPartialExamTypeText('LISTEN_WRITE', 'LISTEN'),
      ).toEqual(`${keyPrefix}.listen`);
      expect(
        ExamSessionUtils.getPartialExamTypeText('LISTEN_WRITE', 'WRITE'),
      ).toEqual(`${keyPrefix}.write`);
    });
  });

  describe('compareExamSessions', () => {
    it('should ignore irrelevant changes between exam sessions', () => {
      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, baseExamSession),
      ).toEqual(0);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, registration_start_date: dayjs('2021-01-01') },
          baseExamSession,
        ),
      ).toEqual(0);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, registration_end_date: dayjs('2089-06-15') },
          baseExamSession,
        ),
      ).toEqual(0);
    });

    it('should prioritise exam sessions based on language code', () => {
      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, language_code: ExamLanguage.DEU },
          baseExamSession,
        ),
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, language_code: ExamLanguage.FIN },
          baseExamSession,
        ),
      ).toEqual(1);
    });

    it('should prioritise exam sessions with room', () => {
      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, {
          ...baseExamSession,
          participants: baseExamSession.max_participants,
        }),
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
          },
          baseExamSession,
        ),
      ).toEqual(1);
    });

    it('should prioritise exam sessions with earlier session date', () => {
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            session_date: dayjs('2098-12-31'),
          },
          baseExamSession,
        ),
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, {
          ...baseExamSession,
          session_date: dayjs('2098-12-31'),
        }),
      ).toEqual(1);
    });

    it('should prioritise comparators', () => {
      // room > earlier session date
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
          },
          {
            ...baseExamSession,
            session_date: dayjs('2098-12-31'),
          },
        ),
      ).toEqual(1);

      // ongoing registration > earlier session date
      // participants set as max_participants for both to avoid es1 to be considered full and es2 not
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
            session_date: dayjs('2098-12-31'),
            registration_end_date: dayjs('2021-01-01'),
            open: false,
          },
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
          },
        ),
      ).toEqual(1);

      // exam date > language
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            session_date: dayjs('2098-12-31'),
          },
          {
            ...baseExamSession,
            language_code: ExamLanguage.DEU,
          },
        ),
      ).toEqual(-1);
    });

    it('should ignore per-part availability and compare partial sessions by total quota', () => {
      // Same total quota/participants, but the parts that are full differ:
      // one is full in the read/listen part, the other in the speak/write part.
      const readFull: ExamSession = {
        ...readSpeakExamSession,
        participants_read_listen: 5,
        participants_speak_write: 0,
      };
      const speakFull: ExamSession = {
        ...readSpeakExamSession,
        participants_read_listen: 0,
        participants_speak_write: 5,
      };

      // The room comparator looks at the overall session quota, not the
      // per-part quotas, so mixed per-part availability does not affect order.
      expect(ExamSessionUtils.compareExamSessions(readFull, speakFull)).toEqual(
        0,
      );
    });

    it('should prioritise a partial session with overall room over a full one', () => {
      const full: ExamSession = {
        ...readSpeakExamSession,
        participants: readSpeakExamSession.max_participants,
      };

      expect(
        ExamSessionUtils.compareExamSessions(readSpeakExamSession, full),
      ).toEqual(-1);
      expect(
        ExamSessionUtils.compareExamSessions(full, readSpeakExamSession),
      ).toEqual(1);
    });

    it('should treat a queued partial session as having no room', () => {
      const queued: ExamSession = { ...readSpeakExamSession, queue: 1 };

      expect(
        ExamSessionUtils.compareExamSessions(readSpeakExamSession, queued),
      ).toEqual(-1);
    });
  });

  describe('getEffectiveRegistrationPeriodDetails', () => {
    const testDay = dayjs('2023-08-11');
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(testDay.toDate());
    });

    it('should return correct data when regular admission is ongoing', () => {
      expectEffectiveRegistrationDetails(baseExamSession, {
        kind: RegistrationKind.Admission,
        open: true,
        availablePlaces: 6,
      });
    });

    it('should indicate session is full if registration period has ended', () => {
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: false,
          upcoming_admission: false,
        },
        {
          kind: RegistrationKind.Admission,
          open: false,
          availablePlaces: 0,
        },
      );
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });
});
