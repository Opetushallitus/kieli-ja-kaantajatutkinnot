import { AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
  PublicRegistrationInitError,
} from 'enums/publicRegistration';
import {
  acceptFetchRegistrationDetails,
  acceptPublicRegistrationInit,
  fetchRegistrationDetails,
  initialState,
  initRegistration,
  registrationReducer,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  setHasTimerExpired,
} from 'redux/reducers/registration';
import { registrationFixture } from 'tests/msw/registrationHandlers';

describe('registrationReducer partialExamType restoration', () => {
  it('stores the selected partialExamType when initiating a registration', () => {
    const state = registrationReducer(
      initialState,
      initRegistration({
        examSessionId: 999,
        registrationKind: RegistrationKind.Queue,
        partialExamType: 'SPEAK',
      }),
    );

    expect(state.initRegistration.partialExamType).toEqual('SPEAK');
    expect(state.initRegistration.examSessionId).toEqual(999);
    expect(state.initRegistration.registrationKind).toEqual(
      RegistrationKind.Queue,
    );
    expect(state.initRegistration.status).toEqual(APIResponseStatus.InProgress);
  });

  it('restores partialExamType from the init response', () => {
    const state = registrationReducer(
      initialState,
      acceptPublicRegistrationInit({
        ...registrationFixture(),
        expires_in: 300,
        partial_exam_type: 'READ',
        registration_id: 42,
        registration_kind: RegistrationKind.Admission,
        is_strongly_identified: true,
      }),
    );

    expect(state.initRegistration.partialExamType).toEqual('READ');
    expect(state.initRegistration.registrationKind).toEqual(
      RegistrationKind.Admission,
    );
    expect(state.initRegistration.status).toEqual(APIResponseStatus.Success);
  });

  it('restores partialExamType when returning to an in-progress registration', () => {
    const identified = registrationReducer(
      initialState,
      fetchRegistrationDetails({
        examSessionId: 999,
        registrationId: 7,
      }),
    );

    expect(identified.initRegistration.partialExamType).toBeUndefined();

    const restored = registrationReducer(
      identified,
      acceptFetchRegistrationDetails({
        ...registrationFixture(),
        registration_id: 7,
        registration_kind: RegistrationKind.Queue,
        partial_exam_type: 'WRITE',
        exam_session: { ...registrationFixture().exam_session, id: 999 },
      }),
    );

    expect(restored.initRegistration.partialExamType).toEqual('WRITE');
    expect(restored.initRegistration.registrationKind).toEqual(
      RegistrationKind.Queue,
    );
    expect(restored.initRegistration.examSessionId).toEqual(999);
    expect(restored.fetchRegistrationStatus).toEqual(APIResponseStatus.Success);
  });
});

describe('registrationReducer reservation timer', () => {
  const acceptInit = (
    overrides: Partial<Parameters<typeof acceptPublicRegistrationInit>[0]>,
  ) =>
    acceptPublicRegistrationInit({
      ...registrationFixture(),
      expires_in: undefined,
      partial_exam_type: 'ALL_PARTS',
      registration_id: 1,
      registration_kind: RegistrationKind.Admission,
      is_strongly_identified: true,
      ...overrides,
    });

  it('sets expiresIn from an ADMISSION init response so the reservation timer is shown', () => {
    const state = registrationReducer(
      initialState,
      acceptInit({
        expires_in: 1800,
        registration_kind: RegistrationKind.Admission,
      }),
    );

    expect(state.initRegistration.expiresIn).toEqual(1800);
  });

  it('leaves expiresIn unset for a QUEUE init response so no reservation timer is shown', () => {
    const state = registrationReducer(
      initialState,
      acceptInit({
        expires_in: undefined,
        registration_kind: RegistrationKind.Queue,
      }),
    );

    expect(state.initRegistration.expiresIn).toBeUndefined();
  });
});

describe('registrationReducer init error mapping', () => {
  const initErrorResponse = (data: unknown, status = 409) =>
    ({ data, status }) as unknown as AxiosResponse;

  it('maps a missing response to a generic error', () => {
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationInit(undefined),
    );

    expect(state.initRegistration.status).toEqual(APIResponseStatus.Error);
    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.Generic,
    });
  });

  it('maps a closed registration period to the Past error', () => {
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationInit(
        initErrorResponse({ error: { closed: true } }),
      ),
    );

    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.Past,
    });
  });

  it('maps a full exam session to the ExamSessionFull error', () => {
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationInit(
        initErrorResponse({ error: { full: true } }),
      ),
    );

    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.ExamSessionFull,
    });
  });

  it('maps an existing registration in another exam session to AlreadyRegistered and keeps its details', () => {
    const otherExamSessionRegistration = {
      id: 99,
      registration_id: 7,
      state: RegistrationStates.Submitted,
    };
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationInit(
        initErrorResponse({
          error: {
            'other-exam-session-registration': otherExamSessionRegistration,
          },
        }),
      ),
    );

    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.AlreadyRegistered,
      otherExamSessionRegistration,
    });
  });

  it('maps a 401 response to an Unauthorized error and returns to the identify step', () => {
    const state = registrationReducer(
      { ...initialState, activeStep: PublicRegistrationFormStep.Register },
      rejectPublicRegistrationInit(initErrorResponse({}, 401)),
    );

    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.Unauthorized,
    });
    expect(state.activeStep).toEqual(PublicRegistrationFormStep.Identify);
  });

  it('falls back to a generic error for an unrecognised error shape', () => {
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationInit(
        initErrorResponse({ error: { exists: true } }),
      ),
    );

    expect(state.initRegistration.error).toEqual({
      error: PublicRegistrationInitError.Generic,
    });
  });
});

describe('registrationReducer submit error mapping', () => {
  const cases: Array<
    [Record<string, boolean>, PublicRegistrationFormSubmitError]
  > = [
    [
      { closed: true },
      PublicRegistrationFormSubmitError.RegistrationPeriodClosed,
    ],
    [{ registered: true }, PublicRegistrationFormSubmitError.AlreadyRegistered],
    [
      { create_payment: true },
      PublicRegistrationFormSubmitError.PaymentCreationFailed,
    ],
    [
      { person_creation: true },
      PublicRegistrationFormSubmitError.PersonCreationFailed,
    ],
    [{ expired: true }, PublicRegistrationFormSubmitError.FormExpired],
  ];

  it.each(cases)('maps %o to the matching submit error', (error, expected) => {
    const state = registrationReducer(
      initialState,
      rejectPublicRegistrationSubmission({ error }),
    );

    expect(state.submitRegistration.status).toEqual(APIResponseStatus.Error);
    expect(state.submitRegistration.error).toEqual(expected);
  });
});

describe('registrationReducer reservation timer expiry', () => {
  it('flags the timer as expired so the unsaved-changes guard is dropped', () => {
    const state = registrationReducer(initialState, setHasTimerExpired(true));

    expect(state.hasTimerExpired).toBe(true);
  });

  it('clears the expired flag when the timer is reset', () => {
    const expired = registrationReducer(initialState, setHasTimerExpired(true));
    const state = registrationReducer(expired, setHasTimerExpired(false));

    expect(state.hasTimerExpired).toBe(false);
  });
});

describe('registration context hydration', () => {
  it('keeps edits and consent when reading the same registration again', () => {
    const context = registrationFixture();
    const loaded = registrationReducer(
      initialState,
      acceptPublicRegistrationInit(context),
    );
    const edited = {
      ...loaded,
      registration: {
        ...loaded.registration,
        email: 'edited@example.invalid',
        termsAndConditionsAgreed: true,
      },
    };
    const refreshed = registrationReducer(
      edited,
      acceptFetchRegistrationDetails({ ...context, expires_in: 1700 }),
    );
    expect(refreshed.registration.email).toBe('edited@example.invalid');
    expect(refreshed.registration.termsAndConditionsAgreed).toBe(true);
  });

  it('clears the previous draft when another registration is loaded', () => {
    const context = registrationFixture();
    const loaded = registrationReducer(
      initialState,
      acceptPublicRegistrationInit(context),
    );
    const edited = {
      ...loaded,
      registration: {
        ...loaded.registration,
        email: 'edited@example.invalid',
        termsAndConditionsAgreed: true,
      },
    };
    const refreshed = registrationReducer(
      edited,
      acceptFetchRegistrationDetails({ ...context, registration_id: 502 }),
    );
    expect(refreshed.registration.email).toBeUndefined();
    expect(refreshed.registration.termsAndConditionsAgreed).toBe(false);
  });

  it.each([RegistrationStates.Submitted, RegistrationStates.Completed])(
    'restores %s from GET',
    (state) => {
      const restored = registrationReducer(
        initialState,
        acceptFetchRegistrationDetails(
          registrationFixture({ state, reservation_expires_at: null }),
        ),
      );
      expect(restored.submitRegistration.status).toBe(
        APIResponseStatus.Success,
      );
      expect(restored.submitRegistration.finalState).toBe(state);
    },
  );

  it('hydrates the authenticated identity after an anonymous init', () => {
    const anonymous = registrationFixture({
      user: {},
      is_strongly_identified: false,
    });
    const loaded = registrationReducer(
      initialState,
      acceptPublicRegistrationInit(anonymous),
    );
    const restored = registrationReducer(
      loaded,
      acceptFetchRegistrationDetails(registrationFixture()),
    );
    expect(restored.isEmailRegistration).toBe(false);
    expect(restored.registration.firstNames).toBe('Nordea');
  });
});
