import * as reactRouterDom from 'react-router-dom';
import renderer from 'react-test-renderer';

import { initI18nForTests } from 'configs/i18n';
import { PaymentStatus } from 'enums/api';
import { EvaluationOrderStatusPage } from 'pages/EvaluationOrderStatusPage';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

jest.unmock('configs/i18n');
jest.requireActual('configs/i18n');

/*
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));
*/

beforeAll(() => {
  initI18nForTests();
});

const mockUseSearchParams = (params: URLSearchParams) => {
  jest
    .spyOn(reactRouterDom, 'useSearchParams')
    .mockReturnValue([params, jest.fn()]);
};

describe('EvaluationOrderStatusPage', () => {
  it('should render view correctly on successful payment', () => {
    mockUseSearchParams(
      new URLSearchParams({ id: '1', status: PaymentStatus.Success })
    );
    const tree = renderer
      .create(
        <DefaultProviders>
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
        <DefaultProviders>
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
        <DefaultProviders>
          <EvaluationOrderStatusPage />
        </DefaultProviders>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
