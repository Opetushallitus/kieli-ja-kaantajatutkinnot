import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { translateOutsideComponent } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { PublicEducationResponse } from 'interfaces/publicEducation';
import { setAPIError } from 'redux/reducers/APIError';
import {
  acceptKoskiEducations,
  getKoskiEducations,
  rejectKoskiEducations,
} from 'redux/reducers/publicEducation';
import { setPublicFreeRegistration } from 'redux/reducers/publicFreeRegistration';
import { SerializationUtils } from 'utils/serialization';

function* getKoskiEducationsSaga() {
  const t = translateOutsideComponent();
  try {
    const response: AxiosResponse<PublicEducationResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.PublicKoskiEducations,
    );
    const { educations, usedFreeRegistrations } = response.data;
    const freeRegistrationBases = educations.map(
      SerializationUtils.mapKoskiEducationToFreeRegistrationBasis,
    );
    yield put(acceptKoskiEducations(freeRegistrationBases));
    const selectedBasis = freeRegistrationBases.find((v) => v);
    yield put(
      setPublicFreeRegistration({
        basis: selectedBasis
          ? { educationType: selectedBasis, source: 'KOSKI' }
          : undefined,
        attemptsUsed: usedFreeRegistrations,
      }),
    );
  } catch (error) {
    yield put(rejectKoskiEducations());
    yield put(setAPIError(t('yki.common.error')));
  }
}

export function* watchGetKoskiEducations() {
  yield takeLatest(getKoskiEducations.type, getKoskiEducationsSaga);
}
