import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  H1,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { ConfirmRegistration } from 'components/registration/steps/register/ConfirmRegistration';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { loadRegistrationToConfirmDetails } from 'redux/reducers/confirmRegistration';
import { confirmRegistrationSelector } from 'redux/selectors/confirmRegistration';

export const ConfirmRegistrationPage = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.register.success',
  });
  const dispatch = useAppDispatch();
  const { examSession, loadDetailsStatus } = useAppSelector(
    confirmRegistrationSelector,
  );

  // React Router
  const params = useParams();

  useEffect(() => {
    if (
      loadDetailsStatus === APIResponseStatus.NotStarted &&
      params.registrationId
    ) {
      dispatch(loadRegistrationToConfirmDetails(+params.registrationId));
    }
  }, [dispatch, params.registrationId, loadDetailsStatus]);

  const loading = loadDetailsStatus === APIResponseStatus.InProgress;

  // TODO Pass also loginLink to ConfirmRegistration component?

  return (
    <Box className="confirm-registration-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="confirm-registration-page__grid-container"
      >
        <H1>{t('heading')}</H1>
        <HeaderSeparator />
        <Paper
          elevation={3}
          className="confirm-registration-page__paper-contents"
        >
          <LoadingProgressIndicator isLoading={loading}>
            <PublicRegistrationExamSessionDetails
              examSession={examSession as ExamSession}
              showOpenings={false}
            />
          </LoadingProgressIndicator>

          <ConfirmRegistration />
        </Paper>
      </Grid>
    </Box>
  );
};
