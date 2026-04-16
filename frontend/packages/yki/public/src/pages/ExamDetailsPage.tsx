import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicRegistrationSubmission,
  identifyRegistration,
  setActiveStep,
} from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

export const ExamDetailsPage = ({
  registrationKind,
}: {
  registrationKind: RegistrationKind;
}) => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.examDetailsPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  const { initRegistration } = useAppSelector(registrationSelector);
  // React Router
  const params = useParams();
  const [searchParams] = useSearchParams();

  const isLoading =
    status === APIResponseStatus.InProgress ||
    initRegistration.status === APIResponseStatus.InProgress;

  useEffect(() => {
    dispatch(setActiveStep(PublicRegistrationFormStep.Register));
  }, [dispatch]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      examSession?.id &&
      params.examSessionId
    ) {
      if (searchParams.get('submitted')) {
        // eslint-disable-next-line no-console
        console.log('initRegistrationState SUBMITTED');
        // If form is already submitted, just reload exam session details
        // and manually set registration status to submitted.
        const code = searchParams.get('code');
        const queue = searchParams.get('queue');
        const registration_kind =
          queue === 'true'
            ? RegistrationKind.Queue
            : RegistrationKind.Admission;
        dispatch(loadExamSession(+params.examSessionId));
        dispatch(
          acceptPublicRegistrationSubmission({
            code: code || '',
            registration_kind,
            state: RegistrationStates.Submitted,
          }),
        );
      } else {
        // Else attempt to initiate registration.
        // eslint-disable-next-line no-console
        console.log(
          'initRegistrationState',
          initRegistration.partialExamType,
          ExamSessionUtils.getPartialExamTypeFromExamSession(
            examSession?.type || 'FULL',
          ),
        );
        dispatch(
          identifyRegistration({
            examSessionId: +params.examSessionId,
            // TODO registrationKind not needed when calling /identify, refactor away!
            registrationKind: RegistrationKind.Admission,
            // Test with "FULL" fallback, verify later how to properly handle partialExamType
            partialExamType: ExamSessionUtils.getPartialExamTypeFromExamSession(
              examSession?.type || 'FULL',
            ),
          }),
        );
      }
    } else if (
      status === APIResponseStatus.Error ||
      isNaN(Number(params.examSessionId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
    }
  }, [
    status,
    dispatch,
    params.examSessionId,
    showToast,
    examSession?.id,
    examSession?.type,
    t,
    searchParams,
    registrationKind,
    initRegistration.partialExamType,
  ]);

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicExamDetailsPageSkeleton />
      ) : (
        <>
          <div className="rows gapped">
            <PublicRegistrationGrid />
          </div>
        </>
      )}
    </Box>
  );
};
