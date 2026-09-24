import { Alert, Button, Grid, Paper } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  CustomButton,
  CustomCircularProgress,
  H1,
  HeaderSeparator,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { RegistrationStepperView } from 'components/registration/PublicRegistrationStepper';
import { PaymentSuccess } from 'components/registration/steps/Payment';
import { ConfirmRegistration } from 'components/registration/steps/register/ConfirmRegistration';
import { SuccessQueued } from 'components/registration/steps/register/SubmitRegistrationDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import {
  PublicRegistrationFormStep,
  PublicRegistrationFormSubmitError,
} from 'enums/publicRegistration';
import { PublicRegistrationExamSessionDetails } from 'features/registration/components/PublicRegistrationExamSessionDetailsv2';
import { MemoizedPublicRegistrationTimer } from 'features/registration/components/PublicRegistrationTimerv2';
import { RegistrationControls } from 'features/registration/components/RegistrationControlsv2';
import { RegistrationIdentification } from 'features/registration/components/RegistrationIdentificationv2';
import { SubmitRegistrationDetails } from 'features/registration/components/steps/register/SubmitRegistrationDetailsv2';
import { usePublicRegistrationErrors } from 'features/registration/hooks/usePublicRegistrationErrorsv2';
import { RegistrationStep } from 'features/registration/modelv2';
import {
  cancelRegistration,
  requestStep,
  retryStep,
  setShowErrors,
  submitPublicRegistration,
} from 'features/registration/redux/reducers/registrationv2';
import {
  RegistrationRoutes,
  responseStep,
  stepPath,
} from 'features/registration/routesv2';
import {
  registrationSelector,
  useAppDispatch,
  useAppSelector,
} from 'features/registration/state/reduxv2';

const Form = ({
  cancel,
  deadline,
}: {
  cancel: ReactNode;
  deadline: string | null;
}) => {
  const { isPhone } = useWindowProperties();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.features.registration',
  });
  const common = useCommonTranslation();
  const fieldNames = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails.errors.fields',
  });
  const dispatch = useAppDispatch();
  const {
    submitRegistration,
    cancelRegistration: cancellation,
    showErrors,
    hasTimerExpired,
  } = useAppSelector(registrationSelector);
  const submissionBlocked =
    submitRegistration.error &&
    [
      PublicRegistrationFormSubmitError.AlreadyRegistered,
      PublicRegistrationFormSubmitError.FormExpired,
      PublicRegistrationFormSubmitError.RegistrationPeriodClosed,
    ].includes(submitRegistration.error);
  const errors = usePublicRegistrationErrors(true)();
  const invalidFields = Object.entries(errors).filter(([, value]) => value);
  const errorRef = useRef<HTMLDivElement>(null);
  const submit = () => {
    dispatch(setShowErrors(true));
    if (invalidFields.length) {
      errorRef.current?.focus();

      return;
    }
    dispatch(submitPublicRegistration());
  };

  return (
    <>
      <SubmitRegistrationDetails />
      <div tabIndex={-1} ref={errorRef}>
        {showErrors && invalidFields.length > 0 && (
          <Alert severity="error" role="alert">
            {t('fixErrors')}
            <ul>
              {invalidFields.map(([field, error]) => (
                <li key={field}>
                  {fieldNames.t(field)}: {common(error)}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        {submitRegistration.status === APIResponseStatus.Error && (
          <Alert severity="error">
            {submitRegistration.error
              ? t(`submitErrors.${submitRegistration.error}`)
              : t('submitFailed')}
            {submissionBlocked && (
              <Button
                component={Link}
                color={Color.Secondary}
                to={RegistrationRoutes.Listing}
              >
                {t('frontpage')}
              </Button>
            )}
          </Alert>
        )}
      </div>
      <RegistrationControls
        cancel={cancel}
        deadline={deadline}
        submit={
          <LoadingProgressIndicator
            translateCommon={common}
            isLoading={
              submitRegistration.status === APIResponseStatus.InProgress
            }
          >
            <CustomButton
              className="margin-top-lg"
              size="large"
              sx={!isPhone ? { width: '30rem', padding: '15px 22px' } : {}}
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={submit}
              disabled={
                hasTimerExpired ||
                !!submissionBlocked ||
                cancellation.status === APIResponseStatus.InProgress ||
                submitRegistration.status === APIResponseStatus.InProgress
              }
              data-testid="public-registration__controlButtons__submit"
            >
              {t('submit')}
            </CustomButton>
          </LoadingProgressIndicator>
        }
      />
    </>
  );
};

export const RegistrationStepPage = ({ step }: { step: RegistrationStep }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.features.registration',
  });
  const legacy = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const common = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const examSessionId = Number(params.examSessionId);
  const registrationId = Number(params.registrationId);
  const validIds =
    Number.isSafeInteger(examSessionId) &&
    examSessionId > 0 &&
    Number.isSafeInteger(registrationId) &&
    registrationId > 0;
  const key = `${location.key}:${location.pathname}`;
  const {
    context,
    fetchRegistrationStatus,
    requestKey,
    loadError,
    cancelRegistration: cancellation,
    submitRegistration,
  } = useAppSelector(registrationSelector);
  const examSession = useAppSelector((state) => state.examSession.examSession);
  useEffect(() => {
    if (validIds)
      dispatch(
        requestStep({ examSessionId, registrationId, step, requestKey: key }),
      );
  }, [dispatch, validIds, examSessionId, registrationId, step, key]);
  const ready =
    validIds &&
    fetchRegistrationStatus === APIResponseStatus.Success &&
    requestKey === key &&
    context?.registration_id === registrationId &&
    context.exam_session.id === examSessionId;
  const target = ready && context ? responseStep(context, step) : undefined;
  useEffect(() => {
    if (target && target !== step)
      navigate(stepPath(target, { examSessionId, registrationId }), {
        replace: true,
      });
  }, [navigate, target, step, examSessionId, registrationId]);
  useEffect(() => {
    if (ready && cancellation.status === APIResponseStatus.Success)
      navigate(RegistrationRoutes.Listing);
  }, [navigate, ready, cancellation.status]);

  if (!validIds || loadError)
    return (
      <Paper className="rows gapped" sx={{ p: 3 }}>
        <Alert severity="error">
          {t(
            loadError === 'session'
              ? 'sessionExpired'
              : loadError === 'network'
                ? 'loadFailed'
                : loadError === 'contract'
                  ? 'invalidDetails'
                  : 'unavailable',
          )}
        </Alert>
        {validIds && loadError === 'network' && (
          <Button
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={() =>
              dispatch(
                retryStep({
                  examSessionId,
                  registrationId,
                  step,
                  requestKey: key,
                }),
              )
            }
          >
            {t('retry')}
          </Button>
        )}
        <Button
          component={Link}
          variant={Variant.Contained}
          color={Color.Secondary}
          to={RegistrationRoutes.Listing}
        >
          {t('frontpage')}
        </Button>
      </Paper>
    );
  if (!ready || !context || target !== step)
    return <CustomCircularProgress color={Color.Secondary} />;
  const queued = context.registration_kind === RegistrationKind.Queue;
  const identify = step === 'Identify';
  const registering = step === 'Register';
  const heading = identify
    ? legacy.t(
        queued
          ? 'steps.identify.titleForQueueing'
          : context.session.identity
            ? 'steps.identify.alreadyLoggedIn.title'
            : 'steps.identify.title',
      )
    : registering
      ? legacy.t(
          `steps.register.inProgress.heading.${queued ? 'queue' : 'admission'}`,
        )
      : legacy.t(
          step === 'Payment' || queued
            ? 'steps.register.success.heading'
            : 'steps.payment.success.heading',
        );
  const cancelButton = (
    <CustomButton
      variant={Variant.Text}
      color={Color.Secondary}
      className={
        identify && context.session.identity
          ? 'fit-content-max-width'
          : undefined
      }
      size={identify && context.session.identity ? 'large' : undefined}
      disabled={
        cancellation.status === APIResponseStatus.InProgress ||
        submitRegistration.status === APIResponseStatus.InProgress
      }
      onClick={() => dispatch(cancelRegistration())}
      data-testid="public-registration__controlButtons__abort"
    >
      {legacy.t(
        identify && context.session.identity
          ? 'steps.identify.alreadyLoggedIn.labels.abort'
          : 'controlButtons.abortRegistration',
      )}
    </CustomButton>
  );
  const cancel = context.state === RegistrationStates.Started && (
    <>
      {cancellation.status === APIResponseStatus.Error && (
        <Alert severity="error">{t('cancelFailed')}</Alert>
      )}
      {identify && context.session.identity ? (
        cancelButton
      ) : (
        <span>{cancelButton}</span>
      )}
    </>
  );

  return (
    <div
      className="public-exam-details-page"
      data-testid={`registration-v2-${step}`}
    >
      <div className="rows gapped">
        <Grid
          container
          rowSpacing={4}
          direction="column"
          className="public-registration"
        >
          <Grid className="public-registration">
            <div className="public-registration__grid">
              <div className="rows gapped-xxl">
                <RegistrationStepperView
                  // The original displays payment instructions in the submitted form step.
                  activeStep={
                    step === 'Payment'
                      ? PublicRegistrationFormStep.Register
                      : PublicRegistrationFormStep[step]
                  }
                />
                <div className="rows public-registration__grid__heading">
                  <div className="rows">
                    <div
                      className={
                        identify
                          ? 'rows'
                          : 'columns space-between align-items-start'
                      }
                    >
                      <H1>{heading}</H1>
                      {!isPhone &&
                        registering &&
                        context.reservation_expires_at && (
                          <MemoizedPublicRegistrationTimer
                            key={registrationId}
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
                <div className="public-registration__grid__form-container">
                  <div className={identify ? 'rows gapped' : undefined}>
                    <PublicRegistrationExamSessionDetails
                      examSession={examSession}
                      showOpenings={identify || registering}
                      partialExamType={context.partial_exam_type}
                    />
                    {identify && (
                      <RegistrationIdentification
                        context={context}
                        examSession={examSession}
                        cancel={cancel}
                      />
                    )}
                    {registering && (
                      <Form
                        cancel={cancel}
                        deadline={context.reservation_expires_at}
                      />
                    )}
                    {step === 'Payment' && (
                      <>
                        {context.payment?.status === 'CANCELLED' && (
                          <Alert severity="info">{t('paymentCancelled')}</Alert>
                        )}
                        {context.payment ? (
                          <ConfirmRegistration
                            paymentDetails={{
                              due_date: dayjs(context.payment.due_date),
                              payment_url: context.payment.url,
                            }}
                          />
                        ) : (
                          <Alert severity="info">{t('paymentPending')}</Alert>
                        )}
                      </>
                    )}
                    {step === 'Done' && (
                      <>
                        <div
                          className={
                            queued
                              ? 'rows gapped'
                              : 'margin-top-xxl rows gapped'
                          }
                        >
                          {queued ? <SuccessQueued /> : <PaymentSuccess />}
                          <Button
                            component={Link}
                            className="fit-content-max-width"
                            variant={Variant.Contained}
                            color={Color.Secondary}
                            to={RegistrationRoutes.Listing}
                          >
                            {common('backToHomePage')}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Paper>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
