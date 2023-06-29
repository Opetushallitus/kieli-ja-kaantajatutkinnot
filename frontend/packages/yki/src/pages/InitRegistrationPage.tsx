import { Box, Grid, Paper } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CustomButton,
  CustomTextField,
  H1,
  H2,
  HeaderSeparator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useToast } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { PublicIdentificationGrid } from 'components/registration/PublicIdentificationGrid';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { loadExamSession } from 'redux/reducers/examSession';
import { resetPublicIdentificationState } from 'redux/reducers/publicIdentification';
import { setActiveStep } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamUtils } from 'utils/exam';

const ContentSelector = () => {
  const examSession = useAppSelector(examSessionSelector).examSession;
  if (!examSession) {
    return null;
  }
  const { open, participants, quota } =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  if (!open || participants >= quota) {
    return <RegistrationNotAvailable />;
  } else {
    return <PublicIdentificationGrid />;
  }
};

const DescribeUnavailability = ({
  now,
  open,
  start,
}: {
  now: Dayjs;
  open: boolean;
  start: Dayjs;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const reasonForUnavailability = !open
    ? now.isBefore(start)
      ? 'upcoming'
      : 'past'
    : 'full';

  return (
    <>
      <H2>{t(reasonForUnavailability + '.title')}</H2>
      <Text>{t(reasonForUnavailability + '.description')}</Text>
    </>
  );
};

const EnrollToQueue = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.enrollToQueue',
  });
  const translateCommon = useCommonTranslation();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const inputEmailError =
    showErrors &&
    InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      required: true,
      value: email,
    });
  const confirmEmailError =
    showErrors && email !== confirmEmail ? 'errors.mismatchingEmailsError' : '';

  return (
    <>
      <Text>
        {t('info.part1')}
        <br />
        {t('info.part2')}
      </Text>
      <div className="columns gapped-xxl">
        <div className="rows">
          <label htmlFor="enroll-to-queue__input-email">
            <Text>
              <b>{t('inputs.email.heading')}</b>
            </Text>
          </label>
          <Text>{t('inputs.email.description')}</Text>
          <CustomTextField
            id="enroll-to-queue__input-email"
            autoComplete={InputAutoComplete.Email}
            error={showErrors}
            helperText={
              inputEmailError ? translateCommon(inputEmailError) : ' '
            }
            showHelperText={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></CustomTextField>
        </div>
        <div className="rows">
          <label htmlFor="enroll-to-queue__confirm-email">
            <Text>
              <b>{t('inputs.confirmEmail.heading')}</b>
            </Text>
          </label>
          <Text>{t('inputs.confirmEmail.description')}</Text>
          <CustomTextField
            id="enroll-to-queue__confirm-email"
            autoComplete={InputAutoComplete.Email}
            error={showErrors}
            helperText={
              confirmEmailError ? translateCommon(confirmEmailError) : ' '
            }
            showHelperText={true}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          ></CustomTextField>
        </div>
      </div>
      <div className="columns">
        <CustomButton
          className="full-max-width"
          color={Color.Secondary}
          variant={Variant.Contained}
          onClick={() => {
            setShowErrors(true);
          }}
        >
          {t('inputs.submit.label')}
        </CustomButton>
      </div>
    </>
  );
};

const RegistrationNotAvailable = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;

  const { kind, open, start } =
    ExamUtils.getCurrentOrFutureAdmissionPeriod(examSession);
  const now = dayjs();
  const queueAvailable =
    open && kind === RegistrationKind.Admission && !examSession.queue_full;

  return (
    <Grid className="public-registration" item>
      <div className="public-registration__grid">
        <div className="rows">
          <H1>{queueAvailable ? t('enrollToQueue.header') : t('header')}</H1>
          <HeaderSeparator />
        </div>
        <Paper elevation={3}>
          <div className="public-registration__grid__form-container">
            <div className="rows gapped">
              <PublicRegistrationExamSessionDetails
                examSession={examSession}
                showOpenings={true}
              />
              {queueAvailable ? (
                <EnrollToQueue />
              ) : (
                <DescribeUnavailability now={now} open={open} start={start} />
              )}
            </div>
          </div>
        </Paper>
      </div>
    </Grid>
  );
};

export const InitRegistrationPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.initRegistrationPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  const { activeStep } = useAppSelector(registrationSelector);
  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    if (activeStep !== PublicRegistrationFormStep.Identify) {
      dispatch(setActiveStep(PublicRegistrationFormStep.Identify));
    }

    return () => {
      dispatch(resetPublicIdentificationState());
    };
  }, [dispatch, activeStep]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      !examSession?.id &&
      params.examSessionId
    ) {
      // Fetch exam details
      dispatch(loadExamSession(+params.examSessionId));
    } else if (
      status === APIResponseStatus.Error ||
      isNaN(Number(params.examSessionId))
    ) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Registration, { replace: true });
    }
  }, [
    status,
    dispatch,
    navigate,
    params.examSessionId,
    showToast,
    examSession?.id,
    t,
  ]);

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicIdentificationPageSkeleton />
      ) : (
        <>
          <div className="rows gapped">
            <ContentSelector />
          </div>
        </>
      )}
    </Box>
  );
};
