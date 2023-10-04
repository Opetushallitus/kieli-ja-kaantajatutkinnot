import dayjs from 'dayjs';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { PublicExamSessionsTable } from 'components/registration/examSession/PublicExamSessionListing';
import { ExamSessionsResponse } from 'interfaces/examSessions';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SerializationUtils } from 'utils/serialization';

describe('PublicExamSessionsTable', () => {
  const testDay = dayjs('2023-08-11');
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(testDay.toDate());
  });

  it('should render correctly', () => {
    const { exam_sessions } =
      SerializationUtils.deserializeExamSessionsResponse(
        examSessions as ExamSessionsResponse
      );
    const tree = renderer
      .create(
        <BrowserRouter>
          <PublicExamSessionsTable examSessions={exam_sessions} />
        </BrowserRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
