import { Grid, Paper } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { H1, H2 } from 'components/Text';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { PublicRegistrationInitErrorView } from 'features/registration/components/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationControlButtons } from 'features/registration/components/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'features/registration/components/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepContents } from 'features/registration/components/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'features/registration/components/PublicRegistrationStepper';
import { MemoizedPublicRegistrationTimer } from 'features/registration/components/PublicRegistrationTimer';
import { examSessionSelector } from 'features/registration/redux/selectors/examSession';
import { publicFreeRegistrationSelector } from 'features/registration/redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'features/registration/redux/selectors/registration';
import { ExamSession } from 'interfaces/examSessions';

const RegistrationForm = () => {
  const { status: fetchRegistrationStatus } =
    useAppSelector(registrationSelector).fetchRegistration;
  const { status: submitFormStatus, code } =
    useAppSelector(registrationSelector).submitRegistration;
  const { examSession } = useAppSelector(examSessionSelector);
  const { id: registrationId } =
    useAppSelector(registrationSelector).registration;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (
      submitFormStatus === APIResponseStatus.Success &&
      !searchParams.get('submitted') &&
      code &&
      registrationId
    ) {
      const url = new URL(window.location.href);
      url.searchParams.set('submitted', 'true');
      url.searchParams.set('code', code);
      window.location.href = url.toString();
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
    switch (fetchRegistrationStatus) {
      case APIResponseStatus.Cancelled:
      case APIResponseStatus.Error:
        return <PublicRegistrationInitErrorView />;
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
  const { status: fetchRegistrationStatus } =
    useAppSelector(registrationSelector).fetchRegistration;

  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      if (fetchRegistrationStatus === APIResponseStatus.Error) {
        return <PublicRegistrationInitErrorView />;
      }
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
  const {
    fetchRegistration: { error: fetchRegistrationError },
    registration: { registrationKind },
  } = useAppSelector(registrationSelector);
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
  const { isFree } = useAppSelector(publicFreeRegistrationSelector);
  const [params] = useSearchParams();
  const paymentStatus = params.get('status') as PaymentStatus;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  if (activeStep === PublicRegistrationFormStep.Register) {
    if (submitFormStatus === APIResponseStatus.Success) {
      return t('steps.register.success.heading');
    } else {
      if (registrationKind === RegistrationKind.Admission) {
        return t('steps.register.inProgress.heading.admission');
      } else {
        return t('steps.register.inProgress.heading.queue');
      }
    }
  } else if (
    activeStep === PublicRegistrationFormStep.Identify &&
    fetchRegistrationError
  ) {
    return t(`unavailable.${fetchRegistrationError}.title`);
  } else if (
    activeStep === PublicRegistrationFormStep.Done &&
    isFree === 'YES'
  ) {
    return t('steps.payment.success.heading');
  } else {
    switch (paymentStatus) {
      case PaymentStatus.Success:
        return t('steps.payment.success.heading');
      case PaymentStatus.Cancel:
        return t('steps.payment.cancel.heading');
      default:
        return t('steps.payment.error.heading');
    }
  }
};

export const PublicRegistrationGrid = () => {
  const { status: examSessionStatus } = useAppSelector(examSessionSelector);
  const { activeStep } = useAppSelector(registrationSelector);
  const {
    fetchRegistration: { status: fetchRegistrationStatus },
    registration: { expiresIn },
  } = useAppSelector(registrationSelector);

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
      <Grid className="public-registration">
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows public-registration__grid__heading">
              <div className="rows">
                <div className="columns space-between align-items-start">
                  <H1>{stepHeading}</H1>
                  {!isPhone &&
                    fetchRegistrationStatus === APIResponseStatus.Success &&
                    expiresIn &&
                    activeStep === PublicRegistrationFormStep.Register && (
                      <MemoizedPublicRegistrationTimer expiresIn={expiresIn} />
                    )}
                </div>
              </div>
            </div>
          </div>
          <Paper
            elevation={isPhone ? 0 : 3}
            style={
              isPhone ? {} : { borderTop: '5px solid ' + ophColors.green2 }
            }
          >
            <LoadingProgressIndicator isLoading={isLoading} displayBlock={true}>
              <StepContentSelector />
            </LoadingProgressIndicator>
          </Paper>
        </div>
      </Grid>
    </Grid>
  );
};
