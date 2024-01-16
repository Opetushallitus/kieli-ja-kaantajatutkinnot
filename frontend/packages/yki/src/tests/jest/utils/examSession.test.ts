import dayjs from 'dayjs';

import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionLocation } from 'interfaces/examSessions';
import { ExamSessionUtils } from 'utils/examSession';

const expectEffectiveRegistrationDetails = (
  es: ExamSession,
  expected: Partial<
    ReturnType<typeof ExamSessionUtils.getEffectiveRegistrationPeriodDetails>
  >
) => {
  const actual = ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
  const expectedKeys = Object.keys(expected);
  const actualSubset = Object.fromEntries(
    expectedKeys.map((k) => [k, actual[k as keyof typeof expected]])
  );
  expect(expected).toEqual(actualSubset);
};

describe('ExamSessionUtils', () => {
  const baseExamSession = {
    id: 1,
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
    queue_full: false,
    participants: 7,
    pa_participants: 0,
    post_admission_quota: 0,
    post_admission_active: false,
    registration_start_date: dayjs('2020-01-01'),
    registration_end_date: dayjs('2090-06-15'),
    upcoming_admission: true,
    upcoming_post_admission: false,
  };

  describe('compareExamSessions', () => {
    it('should ignore irrelevant changes between exam sessions', () => {
      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, baseExamSession)
      ).toEqual(0);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, registration_start_date: dayjs('2021-01-01') },
          baseExamSession
        )
      ).toEqual(0);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, registration_end_date: dayjs('2089-06-15') },
          baseExamSession
        )
      ).toEqual(0);
    });

    it('should prioritise exam sessions based on language code', () => {
      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, language_code: ExamLanguage.DEU },
          baseExamSession
        )
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(
          { ...baseExamSession, language_code: ExamLanguage.FIN },
          baseExamSession
        )
      ).toEqual(1);
    });

    it('should prioritise exam sessions with room', () => {
      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, {
          ...baseExamSession,
          participants: baseExamSession.max_participants,
        })
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
          },
          baseExamSession
        )
      ).toEqual(1);
    });

    it('should prioritise exam sessions without full queue', () => {
      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, {
          ...baseExamSession,
          queue_full: true,
        })
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            queue_full: true,
          },
          baseExamSession
        )
      ).toEqual(1);
    });

    it('should prioritise exam sessions with earlier session date', () => {
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            session_date: dayjs('2098-12-31'),
          },
          baseExamSession
        )
      ).toEqual(-1);

      expect(
        ExamSessionUtils.compareExamSessions(baseExamSession, {
          ...baseExamSession,
          session_date: dayjs('2098-12-31'),
        })
      ).toEqual(1);
    });

    it('should prioritise comparators', () => {
      // room > queue fullness
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            participants: baseExamSession.max_participants,
          },
          {
            ...baseExamSession,
            queue_full: true,
          }
        )
      ).toEqual(1);

      // queue fullness > earlier session date
      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...baseExamSession,
            queue_full: true,
            session_date: dayjs('2098-12-31'),
          },
          baseExamSession
        )
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
          }
        )
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
          }
        )
      ).toEqual(-1);
    });

    it('should value availability of regular and post admission equally', () => {
      const postAdmissionSession = {
        ...baseExamSession,
        registration_end_date: dayjs('2021-01-01'),
        post_admission_active: true,
        post_admission_start_date: dayjs('2021-02-02'),
        post_admission_end_date: dayjs('2090-03-03'),
        post_admission_quota: 5,
        pa_participants: 3,
        upcoming_post_admission: true,
        upcoming_admission: false,
      };

      expect(
        ExamSessionUtils.compareExamSessions(
          postAdmissionSession,
          baseExamSession
        )
      ).toEqual(0);

      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...postAdmissionSession,
            pa_participants: postAdmissionSession.post_admission_quota,
          },
          baseExamSession
        )
      ).toEqual(1);

      expect(
        ExamSessionUtils.compareExamSessions(
          {
            ...postAdmissionSession,
            post_admission_end_date: dayjs('2021-03-03'),
            upcoming_post_admission: false,
          },
          baseExamSession
        )
      ).toEqual(1);
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
        availableQueue: true,
      });
    });

    it('should return regular admission after registration_end_date if post admission is not active', () => {
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: false,
          upcoming_admission: false,
          upcoming_post_admission: false,
        },
        {
          kind: RegistrationKind.Admission,
          open: false,
        }
      );
    });

    it('should return post admission after registration_end_date if post admission is active', () => {
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          upcoming_admission: false,
          upcoming_post_admission: true,
        },
        {
          kind: RegistrationKind.PostAdmission,
          availableQueue: false,
        }
      );

      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          upcoming_admission: false,
          upcoming_post_admission: true,
          post_admission_active: true,
          pa_participants: 3,
          post_admission_quota: 10,
        },
        {
          kind: RegistrationKind.PostAdmission,
          open: true,
          availableQueue: false,
          availablePlaces: 7,
        }
      );
    });

    it('should indicate session is full if registration period has ended', () => {
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: false,
          upcoming_admission: false,
          upcoming_post_admission: false,
        },
        {
          kind: RegistrationKind.Admission,
          open: false,
          availablePlaces: 0,
        }
      );
    });

    it('should allow subscribing for notifications only within regular admission period', () => {
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: true,
          upcoming_admission: true,
          upcoming_post_admission: true,
          queue_full: false,
        },
        {
          availableQueue: true,
        }
      );

      // Queue full -> availableQueue: false
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: true,
          upcoming_admission: true,
          upcoming_post_admission: true,
          queue_full: true,
        },
        {
          availableQueue: false,
        }
      );

      // Regular admission over -> availableQueue: false
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: true,
          upcoming_admission: false,
          upcoming_post_admission: true,
          queue_full: true,
        },
        {
          availableQueue: false,
        }
      );

      // Admission not yet started -> availableQueue: false
      expectEffectiveRegistrationDetails(
        {
          ...baseExamSession,
          open: false,
          upcoming_admission: true,
          upcoming_post_admission: true,
          queue_full: true,
        },
        {
          availableQueue: false,
        }
      );
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });
});
