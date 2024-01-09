import { create } from 'react-test-renderer';
import { PreloadedState } from '@reduxjs/toolkit';

import { RootState } from 'configs/redux';
import { RegistrationKind } from 'enums/app';
import { ExamSession, ExamSessionsResponse } from 'interfaces/examSessions';
import { ContentSelector } from 'pages/InitRegistrationPage';
import { initialState as initialRegistrationState } from 'redux/reducers/registration';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { APIResponseStatus } from 'shared/enums';
import { ExamSessionUtils } from 'utils/examSession';
import { SerializationUtils } from 'utils/serialization';

const renderPageWithSession = (es: ExamSession) => {
  const preloadedState: PreloadedState<RootState> = {
    examSession: {
      status: APIResponseStatus.Success,
      examSession: es,
    },
    registration: initialRegistrationState,
  };
  const tree = create(
    <DefaultProviders preloadedState={preloadedState}>
      <ContentSelector />
    </DefaultProviders>
  ).toJSON();
  return tree;
};

describe('InitRegistrationPage', () => {
  const { exam_sessions } = examSessions as ExamSessionsResponse;
  const sessions = exam_sessions.map(
    SerializationUtils.deserializeExamSessionResponse
  );

  describe('should prompt user to first identify', () => {
    it('if regular admission is ongoing and there is room', () => {
      const examSession = sessions.find((es) => {
        const { open, kind, availablePlaces } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        return (
          open && kind === RegistrationKind.Admission && availablePlaces > 0
        );
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });

    it('if post-admission is ongoing and there is room', () => {
      const examSession = sessions.find((es) => {
        const { open, kind, availablePlaces } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        return (
          open && kind === RegistrationKind.PostAdmission && availablePlaces > 0
        );
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('should allow user to subscribe for notifications of available places', () => {
    it('if admission is ongoing and exam is full but queue is not full', () => {
      const examSession = sessions.find((es) => {
        const { open, availablePlaces, availableQueue } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        return open && availablePlaces === 0 && availableQueue;
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('should not let user proceed', () => {
    it('if exam is full and there is no queue available', () => {
      const examSession = sessions.find((es) => {
        const { open, availablePlaces, availableQueue } =
          ExamSessionUtils.getEffectiveRegistrationPeriodDetails(es);
        return open && availablePlaces === 0 && !availableQueue;
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });

    it('if registration has not yet started', () => {
      const examSession = sessions.find((es) => {
        return !es.open && es.upcoming_admission;
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });

    it('if registration period has already ended', () => {
      const examSession = sessions.find((es) => {
        return (
          !es.open && !es.upcoming_admission && !es.upcoming_post_admission
        );
      }) as ExamSession;
      const tree = renderPageWithSession(examSession);
      expect(tree).toMatchSnapshot();
    });
  });
});
