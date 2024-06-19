import { call, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicFileUploadParameters,
  UploadPostPolicy,
} from 'interfaces/publicFileUpload';
import { storeUploadedFileAttachment } from 'redux/reducers/publicEnrollment';
import {
  acceptFileUpload,
  rejectFileUpload,
  startFileUpload,
} from 'redux/reducers/publicFileUpload';

type UploadPostPolicyResponse = Record<string, string>;

const policyKeys = [
  'key',
  'policy',
  'expires',
  'content-type',
  'x-amz-date',
  'x-amz-signature',
  'x-amz-algorithm',
  'x-amz-credential',
  'x-amz-security-token',
];

const deserializeUploadPostPolicyResponse = (
  response: UploadPostPolicyResponse,
) => {
  const ret: Record<string, string> = {};

  for (const k of Object.keys(response)) {
    if (policyKeys.find((e) => e === k.toLowerCase())) {
      const v = response[k] as string;
      ret[k.toLowerCase()] = v;
    } else if ('bucket' === k.toLowerCase()) {
      ret['bucket'] = response[k];
    } else if ('bucketURI' === k) {
      ret['bucketURI'] = response[k];
    }
  }

  return ret as unknown as UploadPostPolicy;
};

function* startFileUploadSaga(
  action: PayloadAction<PublicFileUploadParameters>,
) {
  try {
    const { examEventId, file } = action.payload;
    const policyResponse: AxiosResponse<UploadPostPolicyResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.UploadPostPolicy.replace(/:examEventId/, `${examEventId}`),
      { params: { filename: file.name } },
    );
    const { bucketURI, ...policy } = deserializeUploadPostPolicyResponse(
      policyResponse.data,
    );

    const formData = new FormData();
    formData.append('key', policy.key);
    formData.append('policy', policy.policy);
    formData.append('expires', policy.expires);
    formData.append('content-type', policy['content-type']);
    formData.append('x-amz-algorithm', policy['x-amz-algorithm']);
    formData.append('x-amz-credential', policy['x-amz-credential']);
    formData.append('x-amz-date', policy['x-amz-date']);
    formData.append('x-amz-signature', policy['x-amz-signature']);
    if (policy['x-amz-security-token']) {
      formData.append('x-amz-security-token', policy['x-amz-security-token']);
    }
    formData.append('file', file);
    // For some reason trying to POST with axios couldn't be made to work -
    // according to S3 error, enctype=multipart/form-data was not set, no matter what.
    // Using fetch however works fine.
    yield call(fetch, bucketURI, {
      method: 'POST',
      body: formData,
    });
    yield put(acceptFileUpload());
    yield put(
      storeUploadedFileAttachment({
        id: policy.key,
        name: file.name,
        size: file.size,
      }),
    );
  } catch (error) {
    yield put(rejectFileUpload());
  }
}

export function* watchFileUpload() {
  yield takeLatest(startFileUpload.type, startFileUploadSaga);
}
