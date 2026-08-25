import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import {
  H1,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { ConfirmRegistration } from 'components/registration/steps/register/ConfirmRegistration';
import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { ExamSession } from 'interfaces/examSessions';
import { loadRegistrationToConfirmDetails } from 'redux/reducers/confirmRegistration';
import { fetchRegistrationDetails } from 'redux/reducers/registration';
import { confirmRegistrationSelector } from 'redux/selectors/confirmRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { userDetailsSelector } from 'redux/selectors/userDetails';
import { SerializationUtils } from 'utils/serialization';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.confirmRegistrationPage',
  });

  return (
    <Grid className="confirm-registration-page__grid-container__item-header">
      <H1>{t('heading')}</H1>
      <HeaderSeparator />
    </Grid>
  );
};

const Contents = () => {
  const { registrationDetails } = useAppSelector(confirmRegistrationSelector);
  const { personDetails } = useAppSelector(userDetailsSelector);
  if (!registrationDetails) {
    return null;
  }
  const lang = getCurrentLang();
  const partialExamType = personDetails?.registrations.find(
    (r) => r.id === registrationDetails.id,
  )?.partialExamType;

  return (
    <Grid>
      <Paper
        elevation={3}
        className="confirm-registration-page__paper-contents"
      >
        <PublicRegistrationExamSessionDetails
          examSession={registrationDetails as unknown as ExamSession}
          showOpenings={false}
          partialExamType={partialExamType}
        />
        <ConfirmRegistration
          paymentDetails={{
            due_date: registrationDetails.due_date,
            payment_url: APIEndpoints.RedirectToPaymentFromUserPortal.replace(
              /:registrationId/,
              `${registrationDetails.id}`,
            ).replace(/:lang/, SerializationUtils.serializeAppLanguage(lang)),
          }}
        />
      </Paper>
    </Grid>
  );
};

export const ConfirmRegistrationPage = () => {
  const dispatch = useAppDispatch();
  const { loadDetailsStatus } = useAppSelector(confirmRegistrationSelector);
  const { fetchRegistrationStatus } = useAppSelector(registrationSelector);

  // React Router
  const params = useParams();

  const registrationId =
    params.registrationId && !isNaN(Number(params.registrationId))
      ? Number(params.registrationId)
      : undefined;

  useEffect(() => {
    if (
      fetchRegistrationStatus === APIResponseStatus.NotStarted &&
      registrationId
    ) {
      dispatch(fetchRegistrationDetails(registrationId));
    }
  }, [dispatch, registrationId, fetchRegistrationStatus]);

  useEffect(() => {
    if (loadDetailsStatus === APIResponseStatus.NotStarted && registrationId) {
      dispatch(loadRegistrationToConfirmDetails(registrationId));
    }
  }, [dispatch, registrationId, loadDetailsStatus]);

  const loading =
    loadDetailsStatus === APIResponseStatus.InProgress ||
    fetchRegistrationStatus === APIResponseStatus.InProgress;

  return (
    <Box className="confirm-registration-page">
      <LoadingProgressIndicator isLoading={loading}>
        <Grid
          container
          rowSpacing={4}
          direction="column"
          className="confirm-registration-page__grid-container"
        >
          <Header />
          <Contents />
        </Grid>
      </LoadingProgressIndicator>
    </Box>
  );
};
