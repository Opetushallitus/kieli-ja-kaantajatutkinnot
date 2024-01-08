import renderer from 'react-test-renderer';
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

  it.skip('should look as expected', () => {
    const tree = renderer
      .create(
        <DefaultProviders preloadedState={preloadedState}>
          <EvaluationOrderPage />
        </DefaultProviders>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
