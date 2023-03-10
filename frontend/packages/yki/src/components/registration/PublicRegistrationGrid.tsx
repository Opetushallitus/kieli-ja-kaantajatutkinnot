import { Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationPaymentSum } from 'components/registration/PublicRegistrationPaymentSum';
import { PublicRegistrationStepContents } from 'components/registration/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { examSessionSelector } from 'redux/selectors/examSession';

export const PublicRegistrationGrid = () => {
  const [disableNext, setDisableNext] = useState(true);

  const disableNextCb = (disabled: boolean) => setDisableNext(disabled);

  const { status, activeStep, examSession, registration, isEmailRegistration } =
    useAppSelector(examSessionSelector);

  // TODO: Add bypass or some another way to skip nav prot when user
  // intentionally chooses to cancel the registration and navigate back
  useNavigationProtection(false);

  const isLoading = status === APIResponseStatus.InProgress;
  const isRegistrationStepActive =
    activeStep === PublicRegistrationFormStep.Register;
  const isDoneStepActive = activeStep === PublicRegistrationFormStep.Done;

  if (!examSession) {
    return null;
  }

  const renderDesktopView = () => (
    <>
      <Grid className="public-registration" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
            <div className="public-registration__grid__form-container">
              <PublicRegistrationStepper activeStep={activeStep} />
              <PublicRegistrationExamSessionDetails
                examSession={examSession}
                showOpenings={!isDoneStepActive}
              />
              <PublicRegistrationStepContents
                activeStep={activeStep}
                registration={registration}
                isLoading={isLoading}
                disableNext={disableNextCb}
                isEmailRegistration={isEmailRegistration}
              />
              {isRegistrationStepActive && (
                <PublicRegistrationPaymentSum examSession={examSession} />
              )}
              {!isDoneStepActive && (
                <PublicRegistrationControlButtons
                  activeStep={activeStep}
                  isLoading={isLoading}
                  disableNext={disableNext}
                />
              )}
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
      className="public-registration"
    >
      {renderDesktopView()}
    </Grid>
  );
};
