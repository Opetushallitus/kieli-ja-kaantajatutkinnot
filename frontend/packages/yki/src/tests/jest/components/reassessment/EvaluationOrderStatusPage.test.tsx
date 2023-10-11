import { PreloadedState } from '@reduxjs/toolkit';
import * as reactRouterDom from 'react-router-dom';
import renderer from 'react-test-renderer';
import { APIResponseStatus } from 'shared/enums';

import { initI18nForTests } from 'configs/i18n';
import { RootState } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import EvaluationOrderStatusPage from 'pages/EvaluationOrderStatusPage';
import { initialState as initialEvaluationOrderState } from 'redux/reducers/evaluationOrder';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { evaluationOrderDetailsResponse } from 'tests/msw/fixtures/evaluationOrder';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');
jest.requireActual('configs/i18n');

beforeAll(() => {
  initI18nForTests();
});

const mockUseSearchParams = (params: URLSearchParams) => {
  jest
    .spyOn(reactRouterDom, 'useSearchParams')
    .mockReturnValue([params, jest.fn()]);
};

const preloadedState: PreloadedState<RootState> = {
  evaluationOrder: {
    ...initialEvaluationOrderState,
    loadEvaluationOrderDetailsState: APIResponseStatus.Success,
    evaluationOrderDetails:
      SerializationUtils.deserializeEvaluationOrderDetailsResponse(
        evaluationOrderDetailsResponse
      ),
  },
};

describe('EvaluationOrderStatusPage', () => {
  it('should render view correctly on successful payment', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Success })
    );
    const tree = renderer
      .create(
        <DefaultProviders preloadedState={preloadedState}>
          <EvaluationOrderStatusPage />
        </DefaultProviders>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should render view correctly on cancelled payment', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Cancel })
    );
    const tree = renderer
      .create(
        <DefaultProviders preloadedState={preloadedState}>
          <EvaluationOrderStatusPage />
        </DefaultProviders>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should render view correctly on payment error', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Error })
    );
    const tree = renderer
      .create(
        <DefaultProviders preloadedState={preloadedState}>
          <EvaluationOrderStatusPage />
        </DefaultProviders>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
