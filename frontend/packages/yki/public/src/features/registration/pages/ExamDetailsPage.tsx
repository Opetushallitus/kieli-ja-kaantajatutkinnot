import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { PublicRegistrationInitErrorView } from 'features/registration/components/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationGrid } from 'features/registration/components/PublicRegistrationGrid';
import { useRegistrationDetails } from 'features/registration/hooks/useRegistrationDetails';
import { acceptPublicRegistrationSubmission } from 'features/registration/redux/reducers/registration';
import { registrationSelector } from 'features/registration/redux/selectors/registration';

export const ExamDetailsPage = () => {
  const dispatch = useAppDispatch();
  const { examSessionId, registrationId } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, isError } = useRegistrationDetails(
    Number(examSessionId),
    Number(registrationId),
    PublicRegistrationFormStep.Register,
  );
  const { registration, submitRegistration } =
    useAppSelector(registrationSelector);
  const submitted = searchParams.get('submitted') === 'true';
  const code = searchParams.get('code');

  useEffect(() => {
    if (
      !isLoading &&
      !isError &&
      submitted &&
      code &&
      registration.registrationKind &&
      submitRegistration.status === APIResponseStatus.NotStarted
    ) {
      dispatch(
        acceptPublicRegistrationSubmission({
          code,
          registration_kind: registration.registrationKind,
          state: RegistrationStates.Submitted,
        }),
      );
    }
  }, [
    dispatch,
    isLoading,
    isError,
    submitted,
    code,
    registration.registrationKind,
    submitRegistration.status,
  ]);

  return (
    <Box className="public-exam-details-page">
      {isLoading ||
      (!isError &&
        submitted &&
        code &&
        submitRegistration.status === APIResponseStatus.NotStarted) ? (
        <PublicExamDetailsPageSkeleton />
      ) : isError ? (
        <PublicRegistrationInitErrorView />
      ) : (
        <div className="rows gapped">
          <PublicRegistrationGrid />
        </div>
      )}
    </Box>
  );
};
