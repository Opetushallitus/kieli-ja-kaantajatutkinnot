import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { ConfirmRegistration } from 'components/registration/steps/register/ConfirmRegistration';
import { H1 } from 'components/Text';
import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { loadRegistrationToConfirmDetails } from 'redux/reducers/confirmRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import { fetchRegistrationDetails } from 'redux/reducers/registration';
import { confirmRegistrationSelector } from 'redux/selectors/confirmRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { SerializationUtils } from 'utils/serialization';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.confirmRegistrationPage',
  });

  return (
    <Grid className="confirm-registration-page__grid-container__item-header">
      <H1>{t('heading')}</H1>
    </Grid>
  );
};

const Contents = () => {
  const { registrationDetails } = useAppSelector(confirmRegistrationSelector);
  const { examSession, status } = useAppSelector(examSessionSelector);
  const { initRegistration } = useAppSelector(registrationSelector);
  if (
    !registrationDetails ||
    initRegistration.registrationId !== registrationDetails.id ||
    !examSession ||
    status !== APIResponseStatus.Success ||
    examSession.id !== initRegistration.examSessionId ||
    !initRegistration.partialExamType
  ) {
    return null;
  }
  const lang = getCurrentLang();

  return (
    <Grid>
      <Paper
        elevation={3}
        className="confirm-registration-page__paper-contents"
      >
        <PublicRegistrationExamSessionDetails
          examSession={examSession}
          showOpenings={false}
          partialExamType={initRegistration.partialExamType}
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
  const { fetchRegistrationStatus, initRegistration } =
    useAppSelector(registrationSelector);
  const { examSession, status: examSessionStatus } =
    useAppSelector(examSessionSelector);

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

  useEffect(() => {
    if (
      fetchRegistrationStatus === APIResponseStatus.Success &&
      initRegistration.registrationId === registrationId &&
      initRegistration.examSessionId !== undefined &&
      (examSessionStatus === APIResponseStatus.NotStarted ||
        examSessionStatus === APIResponseStatus.Success) &&
      examSession?.id !== initRegistration.examSessionId
    ) {
      dispatch(loadExamSession(initRegistration.examSessionId));
    }
  }, [
    dispatch,
    registrationId,
    fetchRegistrationStatus,
    initRegistration.registrationId,
    initRegistration.examSessionId,
    examSessionStatus,
    examSession?.id,
  ]);

  const loading =
    loadDetailsStatus === APIResponseStatus.InProgress ||
    fetchRegistrationStatus === APIResponseStatus.InProgress ||
    examSessionStatus === APIResponseStatus.InProgress;

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
