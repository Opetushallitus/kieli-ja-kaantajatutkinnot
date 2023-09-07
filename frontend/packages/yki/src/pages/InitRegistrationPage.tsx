import { Box, Grid, Paper } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast, useWindowProperties } from 'shared/hooks';

import { EnrollToQueue } from 'components/registration/EnrollToQueue';
import { PublicIdentificationGrid } from 'components/registration/PublicIdentificationGrid';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { ExamSession } from 'interfaces/examSessions';
import { loadExamSession } from 'redux/reducers/examSession';
import { resetPublicIdentificationState } from 'redux/reducers/publicIdentification';
import { setActiveStep } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

const ContentSelector = () => {
  const examSession = useAppSelector(examSessionSelector).examSession;
  if (!examSession) {
    return null;
  }
  const { open, availablePlaces } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  if (!open || !availablePlaces) {
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

const RegistrationNotAvailable = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { isPhone } = useWindowProperties();

  const { open, availableQueue, start } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  const now = dayjs();

  return (
    <Grid className="public-registration" item>
      <div className="public-registration__grid">
        <div className="rows public-registration__grid__heading public-registration__grid__no-stepper">
          <H1>{availableQueue ? t('enrollToQueue.header') : t('header')}</H1>
          <HeaderSeparator />
        </div>
        <Paper elevation={isPhone ? 0 : 3}>
          <div className="public-registration__grid__form-container">
            <div className="rows gapped">
              <PublicRegistrationExamSessionDetails
                examSession={examSession}
                showOpenings={true}
              />
              {availableQueue ? (
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
