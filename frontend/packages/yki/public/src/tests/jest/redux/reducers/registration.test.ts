import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind } from 'enums/app';
import {
  acceptFetchRegistrationDetails,
  acceptPublicRegistrationInit,
  identifyRegistration,
  initialState,
  initRegistration,
  registrationReducer,
} from 'redux/reducers/registration';

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
    expect(state.initRegistration.status).toEqual(
      APIResponseStatus.InProgress,
    );
  });

  it('restores partialExamType from the init response', () => {
    const state = registrationReducer(
      initialState,
      acceptPublicRegistrationInit({
        expires_in: 300,
        partial_exam_type: 'READ',
        registration_id: 42,
        registration_kind: RegistrationKind.Admission,
        is_strongly_identified: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { nationalities: [] } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exam_session: {} as any,
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
    expect(restored.fetchRegistrationStatus).toEqual(
      APIResponseStatus.Success,
    );
  });
});

describe('registrationReducer reservation timer', () => {
  const acceptInit = (
    overrides: Partial<Parameters<typeof acceptPublicRegistrationInit>[0]>,
  ) =>
    acceptPublicRegistrationInit({
      expires_in: undefined,
      partial_exam_type: 'ALL_PARTS',
      registration_id: 1,
      registration_kind: RegistrationKind.Admission,
      is_strongly_identified: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: { nationalities: [] } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exam_session: {} as any,
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
