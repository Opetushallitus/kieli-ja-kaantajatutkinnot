import { Box } from '@mui/material';
import { useSearchParams } from 'react-router';

import { PublicRegistrationInitErrorView } from 'components/registration/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { useRegistrationContext } from 'hooks/useRegistrationContext';

export const RegistrationPaymentStatusPage = () => {
  const [params] = useSearchParams();
  const { isLoading, failed } = useRegistrationContext(
    Number(params.get('examSessionId') || params.get('id')),
    Number(params.get('registrationId')),
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
