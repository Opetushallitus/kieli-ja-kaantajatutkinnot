import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { ClerkExamEventDetails } from 'components/clerkExamEvent/overview/ClerkExamEventDetails';
import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { ClerkExamEventOverviewPageSkeleton } from 'components/skeletons/ClerkExamEventOverviewPageSkeleton';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkExamEventOverview } from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { ExamEventUtils } from 'utils/examEvent';

export const ClerkExamEventOverviewPage: FC = () => {
  // i18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, examEvent } = useAppSelector(
    clerkExamEventOverviewSelector,
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
      !examEventId &&
      params.examEventId
    ) {
      // Fetch exam event overview
      dispatch(loadClerkExamEventOverview(+params.examEventId));
    } else if (
      overviewStatus === APIResponseStatus.Error ||
      isNaN(Number(params.examEventId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [
    overviewStatus,
    dispatch,
    navigate,
    params.examEventId,
    showToast,
    examEventId,
    t,
  ]);

  const pageHeader = examEvent
    ? `${ExamEventUtils.languageAndLevelText(
        examEvent.language,
        examEvent.level,
        translateCommon,
      )} ${DateUtils.formatOptionalDate(examEvent.date)}`
    : '';

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
            <TopControls />
            <ClerkExamEventDetails />
          </>
        )}
      </Paper>
    </Box>
  );
};
