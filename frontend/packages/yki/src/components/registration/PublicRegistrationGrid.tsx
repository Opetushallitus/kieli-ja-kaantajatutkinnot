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

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepContents } from 'components/registration/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ExamSession } from 'interfaces/examSessions';
import { initRegistration } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const RegistrationForm = () => {
  const { status, error } =
    useAppSelector(registrationSelector).initRegistration;
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
  const { examSession } = useAppSelector(examSessionSelector);
  const translateCommon = useCommonTranslation();

  switch (status) {
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
            showOpenings={submitFormStatus !== APIResponseStatus.Success}
          />
          <PublicRegistrationStepContents />
          <PublicRegistrationControlButtons />
        </div>
      );
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

const PaperContents = () => {
  const { activeStep } = useAppSelector(registrationSelector);

  switch (activeStep) {
    case PublicRegistrationFormStep.Register:
      return <RegistrationForm />;
    case PublicRegistrationFormStep.Payment:
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
  const { status: examSessionStatus, examSession } =
    useAppSelector(examSessionSelector);

  const initRegistrationStatus =
    useAppSelector(registrationSelector).initRegistration.status;
  const { activeStep } = useAppSelector(registrationSelector);

  const dispatch = useAppDispatch();

  const stepHeading = <Heading />;

  useEffect(() => {
    if (
      activeStep === PublicRegistrationFormStep.Register &&
      examSession &&
      initRegistrationStatus === APIResponseStatus.NotStarted
    ) {
      dispatch(initRegistration(examSession.id));
    }
  }, [activeStep, dispatch, examSession, initRegistrationStatus]);

  // TODO: Add bypass or some another way to skip nav prot when user
  // intentionally chooses to cancel the registration and navigate back
  useNavigationProtection(false);

  const isLoading = examSessionStatus === APIResponseStatus.InProgress;

  const renderDesktopView = () => (
    <>
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows">
              <H1>{stepHeading}</H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={3}>
            <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
              <PaperContents />
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
