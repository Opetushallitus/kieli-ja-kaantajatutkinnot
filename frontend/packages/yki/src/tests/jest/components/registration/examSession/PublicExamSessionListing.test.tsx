import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { PublicExamSessionsTable } from 'components/registration/examSession/PublicExamSessionListing';
import { ExamSessionsResponse } from 'interfaces/examSessions';
import { setupStore } from 'redux/store';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SerializationUtils } from 'utils/serialization';

describe('PublicExamSessionsTable', () => {
  it('should render correctly', () => {
    const { exam_sessions } =
      SerializationUtils.deserializeExamSessionsResponse(
        examSessions as ExamSessionsResponse,
      );
    const tree = renderer
      .create(
        <Provider store={setupStore()}>
          <BrowserRouter>
            <PublicExamSessionsTable
              examSessions={exam_sessions}
              onPageChange={jest.fn}
              onRowsPerPageChange={jest.fn}
              page={0}
              rowsPerPage={20}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </BrowserRouter>
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
