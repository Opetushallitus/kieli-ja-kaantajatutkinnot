import { Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { PublicAuthGridSkeleton } from 'components/skeletons/PublicAuthGridSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { resetAuthentication, startAuthentication } from 'redux/reducers/auth';
import { initialisePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { setOrToggleSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';
import { authSelector } from 'redux/selectors/auth';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';
import { SerializationUtils } from 'utils/serialization';

export const PublicAuthGrid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { status: authStatus } = useAppSelector(authSelector);
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const { reservationDetailsStatus } = useAppSelector(publicEnrollmentSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get('ticket');

  useEffect(() => {
    if (ticket && authStatus !== APIResponseStatus.Success) {
      navigate(AppRoutes.PublicAuth, { replace: true });
      dispatch(startAuthentication(ticket));
    } else if (authStatus === APIResponseStatus.Success) {
      const examEvent = sessionStorage.getItem('examEvent');

      if (examEvent) {
        const parsedExamEvent = SerializationUtils.deserializePublicExamEvent(
          JSON.parse(examEvent)
        );
        dispatch(setOrToggleSelectedPublicExamEvent(parsedExamEvent));
      }
    }
  }, [dispatch, navigate, ticket, authStatus]);

  useEffect(() => {
    if (selectedExamEvent && authStatus === APIResponseStatus.Success) {
      dispatch(initialisePublicEnrollment(selectedExamEvent));
    } else if (authStatus === APIResponseStatus.Error) {
      navigate(AppRoutes.PublicHomePage, { replace: true });
      dispatch(resetAuthentication());
    }
  }, [dispatch, navigate, selectedExamEvent, authStatus]);

  useEffect(() => {
    if (
      selectedExamEvent &&
      reservationDetailsStatus === APIResponseStatus.Success
    ) {
      navigate(AppRoutes.PublicEnrollment, { replace: true });
      dispatch(resetAuthentication());
    }
  }, [navigate, dispatch, selectedExamEvent, reservationDetailsStatus]);

  useEffect(() => {
    if (
      !ticket &&
      authStatus === APIResponseStatus.NotStarted &&
      reservationDetailsStatus === APIResponseStatus.NotStarted &&
      !selectedExamEvent
    ) {
      navigate(AppRoutes.PublicHomePage, { replace: true });
    }
  }, [
    navigate,
    selectedExamEvent,
    authStatus,
    reservationDetailsStatus,
    ticket,
  ]);

  if (!selectedExamEvent) {
    return null;
  }

  const isExpectedToHaveOpenings = selectedExamEvent.openings > 0;

  // TODO:  change service query param to http%3A%2F%2Flocalhost%3A4002%2Fvkt%2Ftunnistaudu for local testing
  // const serviceParam = encodeURIComponent(
  //   'http://localhost:4002/vkt/tunnistaudu'
  // );
  // const serviceParam = encodeURIComponent(
  //   'https://vkt.testiopintopolku.fi/vkt/tunnistaudu'
  // );
  // const authUrl = `https://testiopintopolku.fi/cas-oppija/login?service=${serviceParam}`;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          {reservationDetailsStatus === APIResponseStatus.InProgress ? (
            <PublicAuthGridSkeleton />
          ) : (
            <div className="public-enrollment__grid__form-container">
              <PublicEnrollmentStepper
                activeStep={PublicEnrollmentFormStep.Authenticate}
                includePaymentStep={isExpectedToHaveOpenings}
              />
              <PublicEnrollmentExamEventDetails
                examEvent={selectedExamEvent}
                showOpenings={isExpectedToHaveOpenings}
              />
              <div className="margin-top-xxl gapped rows">
                <H3>{t('title')}</H3>
                <div className="columns">
                  <LoadingProgressIndicator isLoading={isLoading}>
                    <CustomButton
                      className="public-enrollment__grid__form-container__auth-button"
                      href={APIEndpoints.PublicAuthLogin}
                      variant={Variant.Contained}
                      onClick={() => setIsLoading(true)}
                      color={Color.Secondary}
                      data-testid="public-enrollment__authenticate-button"
                      disabled={isLoading}
                    >
                      {t('buttonText')}
                    </CustomButton>
                  </LoadingProgressIndicator>
                </div>
              </div>
            </div>
          )}
        </Paper>
      </Grid>
    </>
  );

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      {renderDesktopView()}
    </Grid>
  );
};
