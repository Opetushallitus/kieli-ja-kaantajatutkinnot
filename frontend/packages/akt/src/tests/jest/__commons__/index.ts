import { runSaga } from '@redux-saga/core';
import { CallEffect } from 'redux-saga/effects';

export type DispatchAction = { type: string; error?: string };

export const dispatchSaga = async (
  dispatched: Array<DispatchAction>,
  sagaGenerator: () => Generator<CallEffect<void>, void, unknown>
) => {
  return await runSaga(
    {
      dispatch: (action: DispatchAction) => dispatched.push(action),
    },
    sagaGenerator
  );
};
