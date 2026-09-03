import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { H1 } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { ExaminerExamEventDetails } from 'components/examinerExamEvent/overview/ExaminerExamEventDetails';
import { ClerkExamEventOverviewPageSkeleton } from 'components/skeletons/ClerkExamEventOverviewPageSkeleton';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLevel } from 'enums/app';
import {
  loadExaminerExamEventOverview,
  resetExaminerExamEventOverview,
} from 'redux/reducers/examinerExamEventOverview';
import { examinerExamEventOverviewSelector } from 'redux/selectors/examinerExamEventOverview';
import { ExamEventUtils } from 'utils/examEvent';

export const ExaminerExamEventOverviewPage: FC = () => {
  // i18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, examEvent } = useAppSelector(
    examinerExamEventOverviewSelector,
  );

  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const { showToast } = useToast();
  const examEventId = examEvent?.id;
  const isLoading =
    overviewStatus === APIResponseStatus.InProgress || !examEventId;

  useEffect(() => {
    if (
      overviewStatus === APIResponseStatus.NotStarted &&
      params.examEventId &&
      params.oid &&
      examEventId !== parseInt(params.examEventId)
    ) {
      // Fetch exam event overview
      dispatch(
        loadExaminerExamEventOverview({
          oid: params.oid,
          examEventId: +params.examEventId,
        }),
      );
    } else if (
      overviewStatus === APIResponseStatus.Error ||
      isNaN(Number(params.examEventId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
      navigate(AppRoutes.ClerkExcellentLevelPage);
    }
  }, [
    overviewStatus,
    dispatch,
    navigate,
    params.oid,
    params.examEventId,
    showToast,
    examEventId,
    t,
  ]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetExaminerExamEventOverview());
    };
  }, [dispatch]);

  const pageHeader = examEvent
    ? `${ExamEventUtils.languageAndLevelText(
        examEvent.language,
        ExamLevel.GOOD_AND_SATISFACTORY,
        translateCommon,
      )} ${DateUtils.formatOptionalDate(examEvent.date)}`
    : '';
  const backTo = AppRoutes.ExaminerHomePage.replace(':oid', params.oid || '');

  return (
    <Box className="clerk-exam-event-overview-page">
      <H1 data-testid="clerk-exam-event-overview-page__header">{pageHeader}</H1>
      <Paper
        elevation={3}
        className="clerk-exam-event-overview-page__content-container rows"
      >
        {isLoading ? (
          <ClerkExamEventOverviewPageSkeleton />
        ) : (
          <>
            <TopControls backTo={backTo} />
            <ExaminerExamEventDetails />
          </>
        )}
      </Paper>
    </Box>
  );
};
