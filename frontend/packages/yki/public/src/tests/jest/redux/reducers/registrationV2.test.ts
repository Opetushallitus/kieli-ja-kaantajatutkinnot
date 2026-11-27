import { AxiosResponse } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { RegistrationKind } from 'enums/app';
import { PublicRegistrationInitError } from 'enums/publicRegistration';
import {
  acceptFetchRegistrationDetails,
  acceptPublicRegistrationInit,
  fetchRegistrationDetails,
  initRegistration,
  registrationReducer,
  rejectRegistrationDetails,
  updatePublicRegistration,
} from 'features/registration/redux/reducers/registration';
import { PublicRegistrationDetails } from 'interfaces/publicRegistration';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

const details: PublicRegistrationDetails = {
  ...registrationInitResponse,
  registration_id: 42,
  registration_kind: RegistrationKind.Queue,
  partial_exam_type: 'SPEAK',
  expires_in: 1800,
};

describe('registration V2 state', () => {
  it('stores the created registration id on init while keeping the requested exam session details', () => {
    const started = registrationReducer(
      undefined,
      initRegistration({
        examSessionId: 999,
        registrationKind: RegistrationKind.Queue,
        partialExamType: 'SPEAK',
      }),
    );
    const initialized = registrationReducer(
      started,
      acceptPublicRegistrationInit({ registration_id: 42 }),
    );

    expect(initialized.initRegistration).toEqual({
      status: APIResponseStatus.Success,
    });
    expect(initialized.registration).toMatchObject({
      id: 42,
      examSessionId: 999,
      registrationKind: RegistrationKind.Queue,
      partialExamType: 'SPEAK',
    });
    expect(initialized.fetchRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
  });

  it.each([true, false])(
    'stores registration details from GET (strongly identified: %s)',
    (isStronglyIdentified) => {
      const fetched = registrationReducer(
        undefined,
        acceptFetchRegistrationDetails({
          ...details,
          is_strongly_identified: isStronglyIdentified,
        }),
      );

      expect(fetched.registration).toMatchObject({
        id: 42,
        examSessionId: details.exam_session.id,
        registrationKind: RegistrationKind.Queue,
        partialExamType: 'SPEAK',
        expiresIn: 1800,
      });
      expect(fetched.isEmailRegistration).toBe(!isStronglyIdentified);
      // A successful GET must not trigger the listing's init redirect.
      expect(fetched.initRegistration).toEqual({
        status: APIResponseStatus.NotStarted,
      });
      expect(fetched.fetchRegistration).toEqual({
        status: APIResponseStatus.Success,
      });
    },
  );

  it.each([
    [401, '', PublicRegistrationInitError.Unauthorized],
    [
      409,
      { error: { partialFull: true } },
      PublicRegistrationInitError.ExamSessionPartialFull,
    ],
    [404, '', PublicRegistrationInitError.Generic],
  ])(
    'keeps the requested IDs and isolates GET errors from init (%s)',
    (status, data, expectedError) => {
      const loading = registrationReducer(
        undefined,
        fetchRegistrationDetails({ examSessionId: 999, registrationId: 42 }),
      );
      const failed = registrationReducer(
        loading,
        rejectRegistrationDetails({ status, data } as AxiosResponse),
      );

      expect(failed.registration).toMatchObject({ id: 42, examSessionId: 999 });
      expect(failed.fetchRegistration).toEqual({
        status: APIResponseStatus.Error,
        error: { error: expectedError },
      });
      expect(failed.initRegistration.status).toBe(APIResponseStatus.NotStarted);
      const retried = registrationReducer(
        failed,
        fetchRegistrationDetails({ examSessionId: 999, registrationId: 42 }),
      );
      expect(retried.fetchRegistration).toEqual({
        status: APIResponseStatus.InProgress,
      });
    },
  );

  it('preserves registration metadata when the user edits form fields', () => {
    const fetched = registrationReducer(
      undefined,
      acceptFetchRegistrationDetails(details),
    );
    const edited = registrationReducer(
      fetched,
      updatePublicRegistration({
        phoneNumber: '+358501234567',
        termsAndConditionsAgreed: true,
      }),
    );

    expect(edited.registration).toEqual({
      ...fetched.registration,
      phoneNumber: '+358501234567',
      termsAndConditionsAgreed: true,
    });
  });

  it('clears the previous registration and GET state when starting another registration', () => {
    const fetched = registrationReducer(
      undefined,
      acceptFetchRegistrationDetails(details),
    );
    const edited = registrationReducer(
      fetched,
      updatePublicRegistration({ termsAndConditionsAgreed: true }),
    );
    const restarted = registrationReducer(
      edited,
      initRegistration({
        examSessionId: 1000,
        registrationKind: RegistrationKind.Admission,
        partialExamType: 'ALL_PARTS',
      }),
    );

    expect(restarted.registration).toEqual({
      examSessionId: 1000,
      registrationKind: RegistrationKind.Admission,
      partialExamType: 'ALL_PARTS',
      privacyStatementConfirmation: false,
      termsAndConditionsAgreed: false,
      countryCode: '246',
    });
    expect(restarted.initRegistration).toEqual({
      status: APIResponseStatus.InProgress,
    });
    expect(restarted.fetchRegistration.status).toBe(
      APIResponseStatus.NotStarted,
    );
  });
});
