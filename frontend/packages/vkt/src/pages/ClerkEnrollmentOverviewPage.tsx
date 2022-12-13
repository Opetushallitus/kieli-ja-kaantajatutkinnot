import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { H1 } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { ClerkEnrollmentDetails } from 'components/clerkEnrollment/overview/ClerkEnrollmentDetails';
import { TopControls } from 'components/clerkEnrollment/overview/TopControls';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { ExamEventUtils } from 'utils/examEvent';

export const ClerkEnrollmentOverviewPage: FC = () => {
  const translateCommon = useCommonTranslation();

  // Redux
  const { examEvent } = useAppSelector(clerkExamEventOverviewSelector);

  // Navigate
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (!examEvent && params.examEventId) {
      // page was reloaded, return to overview page
      navigate(
        AppRoutes.ClerkExamEventOverviewPage.replace(
          /:examEventId$/,
          `${params.examEventId}`
        )
      );
    }
  }, [examEvent, navigate, params.examEventId]);

  if (!examEvent) {
    return null;
  }

  const pageHeader = `${ExamEventUtils.languageAndLevelText(
    examEvent.language,
    examEvent.level,
    translateCommon
  )} ${DateUtils.formatOptionalDate(examEvent.date)}`;

  return (
    <Box className="clerk-enrollment-overview-page">
      <H1 data-testid="clerk-enrollment-overview-page__header">{pageHeader}</H1>
      <Paper
        elevation={3}
        className="clerk-enrollment-overview-page__content-container rows"
      >
        <TopControls examEventId={examEvent.id} />
        <ClerkEnrollmentDetails />
      </Paper>
    </Box>
  );
};
