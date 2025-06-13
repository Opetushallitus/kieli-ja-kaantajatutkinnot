import { render } from '@testing-library/react';
import { APIResponseStatus } from 'shared/enums';

import { initI18nForTests } from 'configs/i18n';
import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { initialState as initialEvaluationOrderState } from 'redux/reducers/evaluationOrder';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');
jest.requireActual('configs/i18n');

beforeAll(() => {
  initI18nForTests();
});

describe('EvaluationOrderPage', () => {
  const evaluationPeriod =
    SerializationUtils.deserializeEvaluationPeriodResponse(
      evaluationPeriods.evaluation_periods[0],
    );
  const preloadedState = {
    evaluationOrder: {
      ...initialEvaluationOrderState,
      loadPeriodState: APIResponseStatus.Success,
      evaluationPeriod,
    },
  };

  it('should look as expected', () => {
    const { container } = render(
      <DefaultProviders preloadedState={preloadedState}>
        <EvaluationOrderPage />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
