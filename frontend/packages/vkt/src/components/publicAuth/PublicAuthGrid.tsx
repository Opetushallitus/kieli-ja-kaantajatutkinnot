import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { resetAuthentication, startAuthentication } from 'redux/reducers/auth';
import { initialisePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { setSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';
import { AuthSelector } from 'redux/selectors/auth';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';
import { SerializationUtils } from 'utils/serialization';

export const PublicAuthGrid = () => {
  const { status } = useAppSelector(AuthSelector);
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const { reservationDetailsStatus } = useAppSelector(publicEnrollmentSelector);
  const isLoading = [reservationDetailsStatus, status].includes(
    APIResponseStatus.InProgress
  );
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get('ticket');

  useEffect(() => {
    if (ticket && status !== APIResponseStatus.InProgress) {
      navigate(AppRoutes.PublicAuth, { replace: true });
      dispatch(startAuthentication(ticket));
    } else if (status === APIResponseStatus.Success) {
      const examEvent = sessionStorage.getItem('examEvent');

      if (examEvent) {
        const parsedExamEvent = SerializationUtils.deserializePublicExamEvent(
          JSON.parse(examEvent)
        );
        dispatch(setSelectedPublicExamEvent(parsedExamEvent));
      }
    }
  }, [navigate, dispatch, ticket, status]);

  useEffect(() => {
    if (selectedExamEvent && status === APIResponseStatus.Success) {
      dispatch(initialisePublicEnrollment(selectedExamEvent));
    }
  }, [navigate, dispatch, selectedExamEvent, status]);

  useEffect(() => {
    if (
      selectedExamEvent &&
      reservationDetailsStatus === APIResponseStatus.Success
    ) {
      navigate(AppRoutes.PublicEnrollment, { replace: true });
      dispatch(resetAuthentication());
    }
  }, [navigate, dispatch, selectedExamEvent, reservationDetailsStatus]);

  if (!selectedExamEvent) {
    return null;
  }

  const isExpectedToHaveOpenings = selectedExamEvent.openings > 0;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
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
                <CustomButton
                  // https://opintopolku.fi/cas-oppija/login?service=https://opintopolku.fi/JokuSovellus/SovelluksenLogin
                  href="https://testiopintopolku.fi/cas-oppija/login?service=http%3A%2F%2Flocalhost%3A4002%2Fvkt%2Ftunnistaudu"
                  sx={{ width: '168px' }}
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  onClick={() => {
                    //dispatch(initialisePublicEnrollment(selectedExamEvent));
                  }}
                  data-testid="public-enrollment__authenticate-button"
                  disabled={isLoading}
                >
                  {t('buttonText')}
                </CustomButton>
              </div>
            </div>
          </LoadingProgressIndicator>
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
