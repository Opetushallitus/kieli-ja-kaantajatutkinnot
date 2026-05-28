import { render } from '@testing-library/react';
import { APIResponseStatus } from 'shared/enums';

import { RootState } from 'configs/redux';
import { ExamSession, ExamSessionsResponse } from 'interfaces/examSessions';
import { ContentSelector } from 'pages/InitRegistrationPage';
import { initialState as initialRegistrationState } from 'redux/reducers/registration';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { ExamSessionUtils } from 'utils/examSession';
import { SerializationUtils } from 'utils/serialization';

const renderPageWithSession = (examSession: ExamSession) => {
  const preloadedState: Partial<RootState> = {
    examSession: {
      status: APIResponseStatus.Success,
      examSession,
    },
    registration: {
      ...initialRegistrationState,
      initRegistration: {
        status: APIResponseStatus.Success,
        examSessionId: examSession.id,
        registrationKind: examSession.available_registration_kind,
        registrationId: 123,
        partialExamType: 'ALL_PARTS',
      },
    },
  };

  const { container } = render(
    <DefaultProviders preloadedState={preloadedState}>
      <ContentSelector />
    </DefaultProviders>,
  );

  return container;
};

describe('InitRegistrationPage', () => {
  const { exam_sessions } = examSessions as ExamSessionsResponse;
  const sessions = exam_sessions.map(
    SerializationUtils.deserializeExamSessionResponse,
  );

  describe('should prompt user to first identify', () => {
    it('if regular admission is ongoing and there is room', () => {
      const examSession = sessions.find((es) => {
        const { open, availablePlaces } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);

        return es.type === 'FULL' && open && availablePlaces > 0;
      }) as ExamSession;
      const container = renderPageWithSession(examSession);
      expect(container).toMatchSnapshot();
    });
  });

  describe('should not let user proceed', () => {
    it('if registration has not yet started', () => {
      const examSession = sessions.find((es) => {
        return !es.open && es.upcoming_admission;
      }) as ExamSession;
      const container = renderPageWithSession(examSession);
      expect(container).toMatchSnapshot();
    });

    it('if registration period has already ended', () => {
      const examSession = sessions.find((es) => {
        return !es.open && !es.upcoming_admission;
      }) as ExamSession;
      const container = renderPageWithSession(examSession);
      expect(container).toMatchSnapshot();
    });
  });
});
