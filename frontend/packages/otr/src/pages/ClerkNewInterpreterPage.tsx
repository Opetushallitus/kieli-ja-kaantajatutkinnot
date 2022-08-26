import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { TopControls } from 'components/clerkInterpreter/overview/TopControls';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { clerkPersonSearchSelector } from 'redux/selectors/clerkPersonSearch';
import { meetingDatesSelector } from 'redux/selectors/meetingDate';

export const ClerkNewInterpreterPage = () => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.clerkNewInterpreterPage',
  });

  const navigate = useNavigate();

  // Redux
  const { identityNumber, person: _person } = useAppSelector(
    clerkPersonSearchSelector
  );
  const meetingDatesState = useAppSelector(meetingDatesSelector).meetingDates;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!identityNumber) {
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [identityNumber, navigate]);

  useEffect(() => {
    if (
      !meetingDatesState.meetingDates.length &&
      meetingDatesState.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadMeetingDates());
    }
  }, [dispatch, meetingDatesState]);

  return (
    <Box className="clerk-new-interpreter-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-new-interpreter-page__content-container rows"
      >
        <div className="rows gapped">
          <TopControls />
        </div>
      </Paper>
    </Box>
  );
};
