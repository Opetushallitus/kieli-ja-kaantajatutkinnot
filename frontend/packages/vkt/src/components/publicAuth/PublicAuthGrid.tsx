import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, H3 } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicAuthGrid = () => {
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);
  const { reservationDetailsStatus } = useAppSelector(publicEnrollmentSelector);
  const isLoading = reservationDetailsStatus === APIResponseStatus.InProgress;
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (reservationDetailsStatus === APIResponseStatus.Success) {
      navigate(AppRoutes.PublicEnrollment, { replace: true });
    }
  });

  if (!selectedExamEvent) {
    return null;
  }

  const isExpectedToHaveOpenings = selectedExamEvent.openings > 0;

  const renderDesktopView = () => (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
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
