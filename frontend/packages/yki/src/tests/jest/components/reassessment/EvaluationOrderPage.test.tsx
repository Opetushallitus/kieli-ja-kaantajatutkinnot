import renderer from 'react-test-renderer';
import { APIResponseStatus } from 'shared/enums';

import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { initialState as initialEvaluationOrderState } from 'redux/reducers/evaluationOrder';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { renderWithProviders } from 'tests/jest/utils/store';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

describe('EvaluationOrderPage', () => {
  const preloadedState = {
    evaluationOrder: {
      ...initialEvaluationOrderState,
      loadPeriodState: APIResponseStatus.Success,
      evaluationPeriod: SerializationUtils.deserializeEvaluationPeriodResponse(
        evaluationPeriods.evaluation_periods[0]
      ),
    },
  };
  /*
  it('should look as expected', () => {
    renderWithProviders(<EvaluationOrderPage />, {
      preloadedState,
    });
  });
  */
  it('should look as expected', () => {
    const tree = renderer
      .create(
        <DefaultProviders preloadedState={preloadedState}>
          <EvaluationOrderPage />
        </DefaultProviders>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
