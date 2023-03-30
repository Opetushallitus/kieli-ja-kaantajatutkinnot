import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import {
  H1,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepContents } from 'components/registration/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { initRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationGrid = () => {
  const {
    status: examSessionStatus,
    activeStep,
    examSession,
  } = useAppSelector(examSessionSelector);

  const {
    isEmailRegistration,
    registration,
    status: registrationStatus,
  } = useAppSelector(registrationSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (examSession && registrationStatus === APIResponseStatus.NotStarted) {
      dispatch(initRegistration(examSession.id));
    }
  }, [dispatch, examSession, registrationStatus]);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  // TODO: Add bypass or some another way to skip nav prot when user
  // intentionally chooses to cancel the registration and navigate back
  useNavigationProtection(false);

  const isLoading = examSessionStatus === APIResponseStatus.InProgress;
  const isDoneStepActive = activeStep === PublicRegistrationFormStep.Done;

  if (!examSession) {
    return null;
  }

  const renderDesktopView = () => (
    <>
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper activeStep={activeStep} />
            <div className="rows">
              <H1>{t('header')}</H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={3}>
            <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
              <div className="public-registration__grid__form-container">
                <PublicRegistrationExamSessionDetails
                  examSession={examSession}
                  showOpenings={!isDoneStepActive}
                />
                <PublicRegistrationStepContents
                  activeStep={activeStep}
                  registration={registration}
                  isLoading={isLoading}
                  isEmailRegistration={isEmailRegistration}
                />
                {!isDoneStepActive && (
                  <PublicRegistrationControlButtons
                    activeStep={activeStep}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </LoadingProgressIndicator>
          </Paper>
        </div>
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
