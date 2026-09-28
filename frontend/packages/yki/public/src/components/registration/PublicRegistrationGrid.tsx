import { Grid, Paper } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import {
  H1,
  H2,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicRegistrationInitErrorView } from 'components/registration/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepContents } from 'components/registration/PublicRegistrationStepContents';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { MemoizedPublicRegistrationTimer } from 'components/registration/PublicRegistrationTimer';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

const RegistrationForm = () => {
  const { status: initRegistrationStatus } =
    useAppSelector(registrationSelector).initRegistration;
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
  const { examSession } = useAppSelector(examSessionSelector);

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
  const { status: initRegistrationStatus } =
    useAppSelector(registrationSelector).initRegistration;

  switch (activeStep) {
    case PublicRegistrationFormStep.Identify:
      if (initRegistrationStatus === APIResponseStatus.Error) {
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
  const { activeStep, context } = useAppSelector(registrationSelector);
  const { error: initRegistrationError, registrationKind } =
    useAppSelector(registrationSelector).initRegistration;
  const { status: submitFormStatus } =
    useAppSelector(registrationSelector).submitRegistration;
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
    initRegistrationError
  ) {
    return t(`unavailable.${initRegistrationError}.title`);
  } else {
    return context?.state === RegistrationStates.Completed
      ? t('steps.payment.success.heading')
      : t('steps.payment.error.heading');
  }
};

export const PublicRegistrationGrid = () => {
  const { status: examSessionStatus } = useAppSelector(examSessionSelector);
  const { activeStep, context, submitRegistration } =
    useAppSelector(registrationSelector);
  const { status: initRegistrationStatus } =
    useAppSelector(registrationSelector).initRegistration;

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
                    initRegistrationStatus === APIResponseStatus.Success &&
                    context?.registration_kind === RegistrationKind.Admission &&
                    context.reservation_expires_at &&
                    submitRegistration.status !== APIResponseStatus.Success &&
                    activeStep === PublicRegistrationFormStep.Register && (
                      <MemoizedPublicRegistrationTimer
                        deadline={context.reservation_expires_at}
                      />
                    )}
                </div>
                <HeaderSeparator />
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
