import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  H1,
  H2,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepContents } from 'components/registration/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints, PaymentStatus } from 'enums/api';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const RegistrationForm = () => {
  const { status: initRegistrationStatus, error } =
    useAppSelector(registrationSelector).initRegistration;
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
  const { examSession } = useAppSelector(examSessionSelector);
  const translateCommon = useCommonTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (
      submitFormStatus === APIResponseStatus.Success &&
      !searchParams.get('submitted')
    ) {
      const redirectTo = `${window.location.href}?submitted=true`;
      window.location.href = `${APIEndpoints.Logout}?redirect=${redirectTo}`;
    }
  });

  if (submitFormStatus === APIResponseStatus.Success) {
    return (
      <div className="public-registration__grid__form-container">
        <PublicRegistrationExamSessionDetails
          examSession={examSession}
          showOpenings={false}
        />
        <PublicRegistrationStepContents />
        <PublicRegistrationControlButtons />
      </div>
    );
  } else {
    switch (initRegistrationStatus) {
      case APIResponseStatus.Cancelled:
      case APIResponseStatus.Error:
        return (
          <div className="public-registration__grid__form-container">
            <H2>
              {error
                ? translateCommon(`errors.registration.${error}`)
                : translateCommon('error')}
            </H2>
          </div>
        );
      case APIResponseStatus.NotStarted:
      case APIResponseStatus.InProgress:
        return null;
      case APIResponseStatus.Success:
        return (
          <div className="public-registration__grid__form-container">
            <PublicRegistrationExamSessionDetails
              examSession={examSession}
              showOpenings={true}
            />
            <PublicRegistrationStepContents />
            <PublicRegistrationControlButtons />
          </div>
        );
    }
  }
};

const ShowPaymentStatus = () => {
  const { examSession, status } = useAppSelector(examSessionSelector);
  const translateCommon = useCommonTranslation();

  switch (status) {
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <div className="public-registration__grid__form-container">
          <H2>{translateCommon('error')}</H2>
        </div>
      );
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return null;
    case APIResponseStatus.Success:
      if (examSession) {
        return (
          <div className="public-registration__grid__form-container">
            <PublicRegistrationExamSessionDetails
              examSession={examSession as ExamSession}
              showOpenings={false}
            />
            <PublicRegistrationStepContents />
          </div>
        );
      } else {
        return null;
      }
  }
};

const StepContentSelector = () => {
  const { activeStep } = useAppSelector(registrationSelector);

  switch (activeStep) {
    case PublicRegistrationFormStep.Register:
      return <RegistrationForm />;
    case PublicRegistrationFormStep.Done:
      return <ShowPaymentStatus />;
    default:
      return null;
  }
};

const Heading = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
  const [params] = useSearchParams();
  const paymentStatus = params.get('status') as PaymentStatus;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps',
  });

  if (activeStep === PublicRegistrationFormStep.Register) {
    if (submitFormStatus === APIResponseStatus.Success) {
      return t('register.success.heading');
    } else {
      return t('register.inProgress.heading');
    }
  } else {
    switch (paymentStatus) {
      case PaymentStatus.Success:
        return t('payment.success.heading');
      case PaymentStatus.Cancel:
        return t('payment.cancel.heading');
      default:
        return t('payment.error.heading');
    }
  }
};

export const PublicRegistrationGrid = () => {
  const { status: examSessionStatus } = useAppSelector(examSessionSelector);
  const stepHeading = <Heading />;

  const isLoading = examSessionStatus === APIResponseStatus.InProgress;

  const { isPhone } = useWindowProperties();

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-registration"
    >
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows public-registration__grid__heading">
              <H1>{stepHeading}</H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={isPhone ? 0 : 3}>
            <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
              <StepContentSelector />
            </LoadingProgressIndicator>
          </Paper>
        </div>
      </Grid>
    </Grid>
  );
};
