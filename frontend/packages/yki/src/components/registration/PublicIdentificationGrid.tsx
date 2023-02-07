import { Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, H3 } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { increaseActiveStep } from 'redux/reducers/examSession';
import { examSessionSelector } from 'redux/selectors/examSession';

export const PublicIdentificationGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  const navigate = useNavigate();

  const { activeStep, examSession } = useAppSelector(examSessionSelector);
  const dispatch = useAppDispatch();

  if (!examSession) {
    return null;
  }

  const renderDesktopView = () => (
    <>
      <Grid className="public-registration" item>
        <Paper elevation={3}>
          <div className="public-registration__grid__form-container">
            <PublicRegistrationStepper activeStep={activeStep} />
            <PublicRegistrationExamSessionDetails
              examSession={examSession}
              showOpenings={true}
            />
            <div className="margin-top-xxl gapped rows">
              <H3>{t('title')}</H3>
              <CustomButton
                sx={{ width: '168px' }}
                variant={Variant.Contained}
                color={Color.Secondary}
                onClick={() => {
                  // TODO: init authentication for suomi.fi
                  dispatch(increaseActiveStep());
                  navigate(
                    AppRoutes.ExamSessionRegistration.replace(
                      /:examSessionId$/,
                      `${examSession.id}`
                    )
                  );
                }}
                data-testid="public-registration__identify-button"
                disabled={false}
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
      className="public-registration"
    >
      {renderDesktopView()}
    </Grid>
  );
};
