import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import {
  H1,
  H2,
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
import { ExamSession } from 'interfaces/examSessions';
import { initRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const PaperContents = ({
  activeStep,
}: {
  activeStep: PublicRegistrationFormStep;
}) => {
  const { initRegistrationStatus, isEmailRegistration, registration } =
    useAppSelector(registrationSelector);
  const { examSession } = useAppSelector(examSessionSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  const isDoneStepActive = activeStep === PublicRegistrationFormStep.Done;

  switch (initRegistrationStatus) {
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      // TODO Fine-grained error messages?

      return (
        <div className="public-registration__grid__form-container">
          <H2>{t('errors.general')}</H2>
        </div>
      );
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return null;
    case APIResponseStatus.Success:
      return (
        <div className="public-registration__grid__form-container">
          <PublicRegistrationExamSessionDetails
            examSession={examSession as ExamSession}
            showOpenings={!isDoneStepActive}
          />
          <PublicRegistrationStepContents
            activeStep={activeStep}
            registration={registration}
            isEmailRegistration={isEmailRegistration}
          />
          {!isDoneStepActive && (
            <PublicRegistrationControlButtons activeStep={activeStep} />
          )}
        </div>
      );
  }
};

export const PublicRegistrationGrid = () => {
  const {
    status: examSessionStatus,
    activeStep,
    examSession,
  } = useAppSelector(examSessionSelector);

  const { initRegistrationStatus } = useAppSelector(registrationSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      examSession &&
      initRegistrationStatus === APIResponseStatus.NotStarted
    ) {
      dispatch(initRegistration(examSession.id));
    }
  }, [dispatch, examSession, initRegistrationStatus]);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  // TODO: Add bypass or some another way to skip nav prot when user
  // intentionally chooses to cancel the registration and navigate back
  useNavigationProtection(false);

  const isLoading = examSessionStatus === APIResponseStatus.InProgress;

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
              <PaperContents activeStep={activeStep} />
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
