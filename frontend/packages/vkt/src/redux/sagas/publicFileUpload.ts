import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';

import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import {
  PublicFileUploadState,
  UploadPostPolicy,
} from 'interfaces/publicFileUpload';
import {
  acceptFileUpload,
  acceptUploadPostPolicy,
  loadUploadPostPolicy,
  rejectFileUpload,
  rejectUploadPostPolicy,
  startFileUpload,
} from 'redux/reducers/publicFileUpload';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';

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
    }
  }

  return ret as UploadPostPolicy;
};

function* loadUploadPostPolicySaga(action: PayloadAction<number>) {
  try {
    const response: AxiosResponse<UploadPostPolicyResponse> = yield call(
      axiosInstance.get,
      APIEndpoints.UploadPostPolicy.replace(
        /:examEventId/,
        `${action.payload}`,
      ),
    );
    yield put(
      acceptUploadPostPolicy(
        deserializeUploadPostPolicyResponse(response.data),
      ),
    );
  } catch (error) {
    yield put(rejectUploadPostPolicy());
  }
}

function* startFileUploadSaga(action: PayloadAction<File>) {
  try {
    const state: PublicFileUploadState = yield select(publicFileUploadSelector);
    if (!state.policy) {
      yield put(rejectFileUpload());
    } else {
      const {
        status: _status,
        examEventId: _examEventId,
        bucket,
        ...policy
      } = state.policy;
      const postData = { ...policy, file: action.payload };
      // eslint-disable-next-line no-console
      console.log('in startFileUpload, file:', postData.file);

      const formData = new FormData();
      formData.append('key', policy.key as string);
      formData.append('policy', policy.policy as string);
      formData.append('expires', policy.expires as string);
      formData.append('content-type', policy['content-type'] as string);
      formData.append('x-amz-algorithm', policy['x-amz-algorithm'] as string);
      formData.append('x-amz-credential', policy['x-amz-credential'] as string);
      formData.append('x-amz-date', policy['x-amz-date'] as string);
      formData.append('x-amz-signature', policy['x-amz-signature'] as string);
      formData.append('file', postData.file);
      /*for (const field of policyKeys) {
        if (policy[field as keyof UploadPostPolicy]) {
          formData.append(
            field,
            policy[field as keyof UploadPostPolicy] as string,
          );
        }
      }*/
      // TODO Enable CORS!
      /*yield call(
        axiosInstance.postForm,
        `https://${bucket}.s3.localhost.localstack.cloud:4566`,
        postData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );*/
      yield call(
        axiosInstance.post,
        `https://${bucket}.s3.localhost.localstack.cloud:4566`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      yield put(acceptFileUpload());
    }
  } catch (error) {
    yield put(rejectFileUpload());
  }
}

export function* watchUploadPostPolicy() {
  yield takeLatest(loadUploadPostPolicy.type, loadUploadPostPolicySaga);
}

export function* watchFileUpload() {
  yield takeLatest(startFileUpload.type, startFileUploadSaga);
}
