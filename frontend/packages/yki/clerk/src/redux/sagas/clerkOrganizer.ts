import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  ClerkOrganization,
  ClerkOrganizer,
  ClerkOrganizerResponse,
} from 'interfaces/clerkOrganizer';
import {
  FindByOidsOrganization,
  FindByOidsOrganizationResponse,
} from 'interfaces/clerkOrganizerRegistry';
import {
  addClerkOrganizer,
  loadAllOrganizations,
  loadClerkOrganization,
  loadClerkOrganizerRegistry,
  loadClerkOrganizers,
  rejectAddClerkOrganizer,
  rejectAllOrganizations,
  rejectClerkOrganization,
  rejectClerkOrganizers,
  storeAddClerkOrganizer,
  storeAllOrganizations,
  storeClerkOrganization,
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
      `${APIEndpoints.ClerkOrganizer}/${organizer.oid}`,
      requestData,
    );

    const updatedOrganizer =
      SerializationUtils.deserializeClerkOrganizerResponse(response.data);

    yield put(updateClerkOrganizerSuccess(updatedOrganizer));
  } catch (error) {
    yield put(updateClerkOrganizerError());
  }
}

function* loadAllOrganizationsSaga() {
  try {
    const response: AxiosResponse<{
      organisaatiot: Array<ClerkOrganization>;
    }> = yield call(
      axiosInstance.get,
      '/organisaatio-service/rest/organisaatio/v4/hae?searchStr=&aktiiviset=true&suunnitellut=true&lakkautetut=false&lang=fi',
    );
    const organizations_01_02_05 = response.data.organisaatiot.filter((org) => {
      return (
        org.organisaatiotyypit.includes('organisaatiotyyppi_01') ||
        org.organisaatiotyypit.includes('organisaatiotyyppi_02') ||
        org.organisaatiotyypit.includes('organisaatiotyyppi_05')
      );
    });
    yield put(storeAllOrganizations(organizations_01_02_05));
  } catch (error) {
    yield put(rejectAllOrganizations());
  }
}

function* loadClerkOrganizationSaga(action: PayloadAction<Array<string>>) {
  try {
    const findByOidsResponse: AxiosResponse<
      Array<FindByOidsOrganizationResponse>
    > = yield call(
      axiosInstance.post,
      '/organisaatio-service/rest/organisaatio/v3/findbyoids',
      action.payload,
    );

    const organization = findByOidsResponse.data.map(
      SerializationUtils.deserializeFindByOidsOrganizationResponse,
    );
    yield put(storeClerkOrganization(organization[0]));
  } catch (error) {
    yield put(rejectClerkOrganization());
  }
}

function* addClerkOrganizerSaga(action: PayloadAction<ClerkOrganizer>) {
  try {
    const newClerkOrganizerEntry = {
      organizer: action.payload,
      organization: {} as FindByOidsOrganization,
    };
    const findByOidsResponse: AxiosResponse<
      Array<FindByOidsOrganizationResponse>
    > = yield call(
      axiosInstance.post,
      '/organisaatio-service/rest/organisaatio/v3/findbyoids',
      [action.payload.oid],
    );

    newClerkOrganizerEntry.organization = findByOidsResponse.data.map(
      SerializationUtils.deserializeFindByOidsOrganizationResponse,
    )[0];

    yield call(
      axiosInstance.post,
      APIEndpoints.AddClerkOrganizer,
      newClerkOrganizerEntry.organizer,
    );

    yield put(storeAddClerkOrganizer(newClerkOrganizerEntry));
  } catch (error) {
    yield put(rejectAddClerkOrganizer());
  }
}

export function* watchClerkOrganizers() {
  yield takeLatest(
    loadClerkOrganizerRegistry.type,
    loadClerkOrganizerRegistrySaga,
  );
  yield takeLatest(loadClerkOrganizers.type, loadClerkOrganizersSaga);
  yield takeLatest(updateClerkOrganizer.type, updateClerkOrganizerSaga);
  yield takeLatest(loadAllOrganizations.type, loadAllOrganizationsSaga);
  yield takeLatest(loadClerkOrganization.type, loadClerkOrganizationSaga);
  yield takeLatest(addClerkOrganizer.type, addClerkOrganizerSaga);
}
