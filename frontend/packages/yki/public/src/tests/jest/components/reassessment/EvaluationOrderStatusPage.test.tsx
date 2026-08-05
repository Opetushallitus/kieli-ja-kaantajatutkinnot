import { render } from '@testing-library/react';
import * as reactRouterDom from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { initI18nForTests } from 'configs/i18n';
import { RootState } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { EvaluationOrderStatusPage } from 'pages/EvaluationOrderStatusPage';
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

const preloadedState: Partial<RootState> = {
  evaluationOrder: {
    ...initialEvaluationOrderState,
    loadEvaluationOrderDetailsState: APIResponseStatus.Success,
    evaluationOrderDetails:
      SerializationUtils.deserializeEvaluationOrderDetailsResponse(
        evaluationOrderDetailsResponse,
      ),
  },
};

describe('EvaluationOrderStatusPage', () => {
  it('should render view correctly on successful payment', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Success }),
    );
    const { container } = render(
      <DefaultProviders preloadedState={preloadedState}>
        <EvaluationOrderStatusPage />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
  it('should render view correctly on cancelled payment', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Cancel }),
    );
    const { container } = render(
      <DefaultProviders preloadedState={preloadedState}>
        <EvaluationOrderStatusPage />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
  it('should render view correctly on payment error', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Error }),
    );
    const { container } = render(
      <DefaultProviders preloadedState={preloadedState}>
        <EvaluationOrderStatusPage />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
