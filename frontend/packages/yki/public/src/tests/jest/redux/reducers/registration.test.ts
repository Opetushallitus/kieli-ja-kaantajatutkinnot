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
  identifyRegistration,
  initialState,
  initRegistration,
  registrationReducer,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  setHasTimerExpired,
} from 'redux/reducers/registration';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

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
        ...registrationInitResponse,
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
    // Identifying does not yet know the part; it is fetched afterwards.
    const identified = registrationReducer(
      initialState,
      identifyRegistration({
        examSessionId: 999,
        registrationKind: RegistrationKind.Queue,
        registrationId: 7,
      }),
    );

    expect(identified.initRegistration.partialExamType).toBeUndefined();

    const restored = registrationReducer(
      identified,
      acceptFetchRegistrationDetails({
        id: 7,
        kind: RegistrationKind.Queue,
        partial_exam_type: 'WRITE',
        exam_session_id: 999,
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
      ...registrationInitResponse,
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
