import { AxiosResponse } from 'axios';
import { put, takeLatest } from 'redux-saga/effects';

import axiosInstance from 'configs/axios';
import { PublicTranslatorResponse } from 'interfaces/publicTranslator';
import {
  PUBLIC_TRANSLATOR_ERROR,
  PUBLIC_TRANSLATOR_LOAD,
  PUBLIC_TRANSLATOR_LOADING,
  PUBLIC_TRANSLATOR_RECEIVED,
} from 'redux/actionTypes/publicTranslator';
import {
  callFetchPublicTranslators,
  fetchPublicTranslators,
  watchFetchPublicTranslators,
} from 'redux/sagas/publicTranslator';
import { DispatchAction, dispatchSaga } from 'tests/jest/__commons__/index';
import {
  createResponse,
  expectedResponse,
} from 'tests/jest/__fixtures__/publicTranslator';

describe('Saga: publicTranslators', () => {
  it('should invoke a LOADING action', () => {
    const genObject = watchFetchPublicTranslators();
    const genPublicTranslators = fetchPublicTranslators();

    expect(genObject.next().value).toEqual(
      takeLatest(PUBLIC_TRANSLATOR_LOAD, fetchPublicTranslators)
    );

    expect(genPublicTranslators.next().value).toEqual(
      put({ type: PUBLIC_TRANSLATOR_LOADING })
    );
  });

  it('should invoke an ERROR action in case of API fails', async () => {
    const dispatched: DispatchAction[] = [];
    jest.spyOn(axiosInstance, 'get').mockImplementationOnce(() => {
      throw 'Error!';
    });

    await dispatchSaga(dispatched, callFetchPublicTranslators);

    expect(dispatched).toEqual([
      { type: PUBLIC_TRANSLATOR_LOADING },
      { type: PUBLIC_TRANSLATOR_ERROR, error: 'Error!' },
    ]);
  });

  it('should transform and store API results', async () => {
    const dispatched: DispatchAction[] = [];
    const mockResponse = (
      _endpoint: string
    ): Promise<AxiosResponse<PublicTranslatorResponse>> => {
      return Promise.resolve(createResponse(expectedResponse));
    };
    jest.spyOn(axiosInstance, 'get').mockImplementationOnce(mockResponse);

    await dispatchSaga(dispatched, callFetchPublicTranslators);

    expect(dispatched).toEqual([
      { type: PUBLIC_TRANSLATOR_LOADING },
      {
        type: PUBLIC_TRANSLATOR_RECEIVED,
        ...expectedResponse,
      },
    ]);
  });
});
