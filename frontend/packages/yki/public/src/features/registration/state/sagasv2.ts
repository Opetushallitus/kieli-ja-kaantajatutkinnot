import { AxiosResponse, isAxiosError } from 'axios';
import {
  all,
  call,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLeading,
} from 'redux-saga/effects';
import { APIResponseStatus } from 'shared/enums';

import axios from 'configs/axios';
import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  cancelRegistrationRequest,
  getRegistrationDetails,
  initRegistrationRequest,
  submitRegistrationRequest,
} from 'features/registration/api/apiv2';
import { RegistrationContext } from 'features/registration/modelv2';
import {
  acceptCancelRegistration,
  acceptPublicRegistrationInit,
  acceptPublicRegistrationSubmission,
  cancelRegistration,
  initRegistration,
  loadStep,
  rejectCancelRegistration,
  rejectPublicRegistrationInit,
  rejectPublicRegistrationSubmission,
  rejectStep,
  requestStep,
  resetPublicRegistration,
  setActiveStep,
  startCancellation,
  startRegistration,
  startSubmission,
  submitPublicRegistration,
} from 'features/registration/redux/reducers/registrationv2';
import { RootState } from 'features/registration/redux/store/indexv2';
import { storeExamSession } from 'redux/reducers/examSession';
import { resetKoskiEducations } from 'redux/reducers/publicEducation';
import { resetPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import { acceptSession } from 'redux/reducers/session';
import { watchExamSessions } from 'redux/sagas/examSession';
import { watchLanguages } from 'redux/sagas/languages';
import { watchNationalities } from 'redux/sagas/nationalities';
import { watchGetKoskiEducations } from 'redux/sagas/publicEducation';
import { SerializationUtils } from 'utils/serialization';

function* acceptContext(data: RegistrationContext) {
  const state: RootState = yield select();
  if (state.registration.context?.registration_id !== data.registration_id) {
    yield put(resetPublicFreeRegistration());
    yield put(resetKoskiEducations());
  }
  yield put(
    storeExamSession(
      SerializationUtils.deserializeExamSessionResponse(data.exam_session),
    ),
  );
  yield put(acceptSession(data.session));
  yield put(acceptPublicRegistrationInit(data));
}
function validate(
  data: RegistrationContext,
  examSessionId: number,
  registrationId?: number,
) {
  if (
    data.exam_session?.id !== examSessionId ||
    (registrationId && data.registration_id !== registrationId) ||
    !data.partial_exam_type ||
    !data.state ||
    !data.session ||
    !Number.isSafeInteger(data.registration_id)
  ) {
    throw new Error('Incomplete or mismatched registration response');
  }
}
function* readStep(action: ReturnType<typeof requestStep>) {
  const state: RootState = yield select();
  // Deduplicate React remounts/StrictMode; a new history entry or reload gets a new read.
  if (state.registration.requestKey === action.payload.requestKey) return;
  yield put(loadStep(action.payload));
  yield race({
    result: call(function* () {
      try {
        const response: AxiosResponse<RegistrationContext> = yield call(
          getRegistrationDetails,
          action.payload,
        );
        validate(
          response.data,
          action.payload.examSessionId,
          action.payload.registrationId,
        );
        if (
          ![
            RegistrationStates.Started,
            RegistrationStates.Submitted,
            RegistrationStates.Completed,
          ].includes(response.data.state)
        ) {
          yield put(rejectStep('unavailable'));

          return;
        }
        yield call(acceptContext, response.data);
        yield put(
          setActiveStep(PublicRegistrationFormStep[action.payload.step]),
        );
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        yield put(
          rejectStep(
            status === 401 || status === 403
              ? 'session'
              : status === 404 || status === 410
                ? 'unavailable'
                : 'network',
          ),
        );
      }
    }),
    superseded: take([loadStep.type, resetPublicRegistration.type]),
  });
}

type Command =
  | ReturnType<typeof initRegistration>
  | ReturnType<typeof submitPublicRegistration>
  | ReturnType<typeof cancelRegistration>;
function* execute(action: Command) {
  const state: RootState = yield select();
  if (initRegistration.match(action)) {
    yield put(startRegistration(action.payload));
    yield put(resetPublicFreeRegistration());
    yield put(resetKoskiEducations());
    try {
      const response: AxiosResponse<RegistrationContext> = yield call(
        initRegistrationRequest,
        action.payload,
      );
      validate(response.data, action.payload.examSessionId);
      if (response.data.partial_exam_type !== action.payload.partialExamType)
        throw new Error('Selection mismatch');
      yield call(acceptContext, response.data);
    } catch (error) {
      yield put(
        rejectPublicRegistrationInit(
          isAxiosError(error) ? error.response : undefined,
        ),
      );
    }

    return;
  }
  const context = state.registration.context;
  if (
    !context ||
    context.state !== RegistrationStates.Started ||
    state.registration.fetchRegistrationStatus !== APIResponseStatus.Success
  )
    return;
  const key = {
    examSessionId: context.exam_session.id,
    registrationId: context.registration_id,
  };
  if (cancelRegistration.match(action)) {
    yield put(startCancellation());
    try {
      yield call(cancelRegistrationRequest, key);
      yield put(acceptCancelRegistration());
    } catch (error) {
      yield put(rejectCancelRegistration());
      if (
        isAxiosError(error) &&
        [401, 403].includes(error.response?.status || 0)
      )
        yield put(rejectStep('session'));
    }

    return;
  }
  yield put(startSubmission());
  try {
    let freeRegistrationId: number | undefined;
    if (
      state.publicFreeRegistration.isFree === 'YES' &&
      state.publicFreeRegistration.basis
    ) {
      const response: AxiosResponse<{ id: number }> = yield call(
        axios.post,
        APIEndpoints.PublicFreeRegistrationEducation.replace(
          ':registrationId',
          String(key.registrationId),
        ),
        { basis: state.publicFreeRegistration.basis },
      );
      freeRegistrationId = response.data.id;
    }
    const response: AxiosResponse<RegistrationContext> = yield call(
      submitRegistrationRequest,
      key,
      {
        ...SerializationUtils.serializeRegistrationForm(
          state.registration.registration,
          state.nationalities.nationalities,
        ),
        nationalities: state.registration.registration.nationality
          ? [state.registration.registration.nationality]
          : [],
        ...(freeRegistrationId
          ? { free_registration_id: freeRegistrationId }
          : {}),
        lang: SerializationUtils.serializeAppLanguage(getCurrentLang()),
      },
    );
    validate(response.data, key.examSessionId, key.registrationId);
    yield call(acceptContext, response.data);
    yield put(
      acceptPublicRegistrationSubmission({
        code: '',
        state: response.data.state,
        registration_kind: response.data.registration_kind,
      }),
    );
  } catch (error) {
    if (
      isAxiosError(error) &&
      [401, 403].includes(error.response?.status || 0)
    ) {
      yield put(rejectStep('session'));
    } else {
      yield put(
        rejectPublicRegistrationSubmission(
          isAxiosError(error) && error.response?.data?.error
            ? error.response.data
            : { error: {} },
        ),
      );
    }
  }
}
function* watchRegistration() {
  yield takeEvery(requestStep.type, readStep);
  yield takeLeading(
    [
      initRegistration.type,
      submitPublicRegistration.type,
      cancelRegistration.type,
    ],
    function* (action: Command) {
      yield race({
        result: call(execute, action),
        left: take([resetPublicRegistration.type, loadStep.type]),
      });
    },
  );
}
export default function* rootSaga() {
  yield all([
    watchRegistration(),
    watchExamSessions(),
    watchLanguages(),
    watchNationalities(),
    watchGetKoskiEducations(),
  ]);
}
