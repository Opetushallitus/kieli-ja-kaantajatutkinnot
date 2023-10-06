import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { APIResponseStatus } from 'shared/enums';

import { PublicEvaluationPeriodListing } from 'components/reassessment/PublicEvaluationPeriodListing';
import { EvaluationPeriodsResponse } from 'interfaces/evaluationPeriod';
import { setupStore } from 'redux/store';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { SerializationUtils } from 'utils/serialization';

describe('PublicEvaluationPeriodListing', () => {
  const testDay = dayjs('2023-08-11');
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(testDay.toDate());
  });

  const preloadedState = {
    evaluationPeriods: {
      status: APIResponseStatus.Success,
      evaluation_periods:
        SerializationUtils.deserializeEvaluationPeriodsResponse(
          evaluationPeriods as EvaluationPeriodsResponse
        ).evaluation_periods,
    },
  };

  it('should render correctly', () => {
    const tree = renderer
      .create(
        <Provider store={setupStore(preloadedState)}>
          <BrowserRouter>
            <PublicEvaluationPeriodListing />
          </BrowserRouter>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
