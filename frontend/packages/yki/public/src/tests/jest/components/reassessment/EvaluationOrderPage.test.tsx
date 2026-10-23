import { render } from '@testing-library/react';
import { APIResponseStatus } from 'shared/enums';

import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { initialState as initialEvaluationOrderState } from 'redux/reducers/evaluationOrder';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

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
