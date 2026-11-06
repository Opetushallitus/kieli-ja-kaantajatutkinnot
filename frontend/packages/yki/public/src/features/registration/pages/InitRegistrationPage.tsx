import { Box } from '@mui/material';
import { useParams, useSearchParams } from 'react-router';

import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { PublicRegistrationInitErrorView } from 'features/registration/components/errors/PublicRegistrationInitErrorView';
import { PublicIdentificationGrid } from 'features/registration/components/PublicIdentificationGrid';
import { RegistrationNotAvailable } from 'features/registration/components/RegistrationNotAvailable';
import { useRegistrationDetails } from 'features/registration/hooks/useRegistrationDetails';
import { examSessionSelector } from 'features/registration/redux/selectors/examSession';
import { ExamSessionUtils } from 'utils/examSession';

const ContentSelector = () => {
  const { examSession } = useAppSelector(examSessionSelector);
  if (!examSession) {
    return null;
  }
  const { open } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  return open ? <PublicIdentificationGrid /> : <RegistrationNotAvailable />;
};

export const InitRegistrationPage = () => {
  const { examSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, isError } = useRegistrationDetails(
    Number(examSessionId),
    Number(searchParams.get('registrationId')),
    PublicRegistrationFormStep.Identify,
  );

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicIdentificationPageSkeleton />
      ) : isError ? (
        <PublicRegistrationInitErrorView />
      ) : (
        <div className="rows gapped">
          <ContentSelector />
        </div>
      )}
    </Box>
  );
};
