import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkOrganizer,
  ClerkOrganizerResponse,
} from 'interfaces/clerkOrganizer';
import {
  FindByOidsOrganization,
  FindByOidsOrganizationResponse,
} from 'interfaces/clerkOrganizerRegistry';
import {
  loadClerkOrganizerRegistry,
  loadClerkOrganizers,
  rejectClerkOrganizers,
  storeClerkOrganizerRegistry,
  storeClerkOrganizers,
  updateClerkOrganizer,
  updateClerkOrganizerError,
  updateClerkOrganizerSuccess,
} from 'redux/reducers/clerkOrganizer';
import { SerializationUtils } from 'utils/serialization';

function* loadClerkOrganizerRegistrySaga() {
  const fetchedOrganizers: ClerkOrganizer[] = [];
  const organizationIds = [''];
  const fetchedOrganizations: FindByOidsOrganization[] = [];
  const registry = [];

  try {
    const response: AxiosResponse<Array<ClerkOrganizerResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkOrganizer,
    );
    const organizers = response.data.map(
      SerializationUtils.deserializeClerkOrganizerResponse,
    );
    for (const key in organizers) {
      fetchedOrganizers.push(organizers[key]);
    }
    for (const key in fetchedOrganizers) {
      organizationIds.push(fetchedOrganizers[key].oid);
    }
    const findByOidsResponse: AxiosResponse<
      Array<FindByOidsOrganizationResponse>
    > = yield call(
      axiosInstance.post,
      '/organisaatio-service/rest/organisaatio/v3/findbyoids',
      organizationIds,
    );

    const findByOids = findByOidsResponse.data.map(
      SerializationUtils.deserializeFindByOidsOrganizationResponse,
    );

    for (const key in findByOids) {
      fetchedOrganizations.push(findByOids[key]);
    }

    for (const key in fetchedOrganizers) {
      const organization = fetchedOrganizations.find(
        (org) => org.oid === fetchedOrganizers[key].oid,
      );
      registry.push({
        organizer: fetchedOrganizers[key],
        organization: organization,
      });
    }

    yield put(storeClerkOrganizerRegistry(registry));
  } catch (error) {
    yield put(rejectClerkOrganizers());
  }
}

function* loadClerkOrganizersSaga() {
  try {
    const response: AxiosResponse<Array<ClerkOrganizerResponse>> = yield call(
      axiosInstance.get,
      APIEndpoints.ClerkOrganizer,
    );
    const organizers = response.data.map(
      SerializationUtils.deserializeClerkOrganizerResponse,
    );
    yield put(storeClerkOrganizers(organizers));
  } catch (error) {
    yield put(rejectClerkOrganizers());
  }
}

function* updateClerkOrganizerSaga(
  action: ReturnType<typeof updateClerkOrganizer>,
) {
  try {
    const organizer = action.payload;
    const requestData = SerializationUtils.serializeClerkOrganizer(organizer);

    const response: AxiosResponse<ClerkOrganizerResponse> = yield call(
      axiosInstance.put,
      `${APIEndpoints.ClerkOrganizer}/${organizer.id}`,
      requestData,
    );

    yield new Promise((resolve) => setTimeout(resolve, 3000));

    const updatedOrganizer =
      SerializationUtils.deserializeClerkOrganizerResponse(response.data);
    yield put(updateClerkOrganizerSuccess(updatedOrganizer));
  } catch (error) {
    yield put(updateClerkOrganizerError());
  }
}

export function* watchClerkOrganizers() {
  yield takeLatest(
    loadClerkOrganizerRegistry.type,
    loadClerkOrganizerRegistrySaga,
  );
  yield takeLatest(loadClerkOrganizers.type, loadClerkOrganizersSaga);
  yield takeLatest(updateClerkOrganizer.type, updateClerkOrganizerSaga);
}
