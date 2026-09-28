import { Box } from '@mui/material';
import { useParams } from 'react-router';

import { PublicRegistrationInitErrorView } from 'components/registration/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { useRegistrationContext } from 'hooks/useRegistrationContext';

export const FreeRegistrationSuccessPage = () => {
  const params = useParams();
  const { isLoading, failed } = useRegistrationContext(
    Number(params.examSessionId),
    Number(params.registrationId),
  );

  return (
    <Box className="registration-payment-status-page">
      {isLoading ? (
        <PublicExamDetailsPageSkeleton />
      ) : failed ? (
        <PublicRegistrationInitErrorView />
      ) : (
        <div className="rows gapped">
          <PublicRegistrationGrid />
        </div>
      )}
    </Box>
  );
};
