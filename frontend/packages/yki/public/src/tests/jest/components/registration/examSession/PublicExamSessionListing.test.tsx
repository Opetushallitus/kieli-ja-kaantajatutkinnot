import { render } from '@testing-library/react';

import { PublicExamSessionsTable } from 'components/registration/examSession/PublicExamSessionListing';
import { ExamSessionsResponse } from 'interfaces/examSessions';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { SerializationUtils } from 'utils/serialization';

describe('PublicExamSessionsTable', () => {
  it('should render correctly', () => {
    const { exam_sessions } =
      SerializationUtils.deserializeExamSessionsResponse(
        examSessions as ExamSessionsResponse,
      );

    const { container } = render(
      <DefaultProviders store={setupStore()}>
        <PublicExamSessionsTable
          examSessions={exam_sessions}
          onPageChange={jest.fn}
          onRowsPerPageChange={jest.fn}
          page={0}
          rowsPerPage={20}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
