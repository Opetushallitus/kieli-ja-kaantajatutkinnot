import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router';

import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { useAppDispatch } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { PublicRegistrationInitErrorView } from 'features/registration/components/errors/PublicRegistrationInitErrorView';
import { PublicRegistrationGrid } from 'features/registration/components/PublicRegistrationGrid';
import { useRegistrationDetails } from 'features/registration/hooks/useRegistrationDetails';
import { setPublicFreeRegistration } from 'features/registration/redux/reducers/publicFreeRegistration';

export const FreeRegistrationSuccessPage = () => {
  const dispatch = useAppDispatch();
  const { examSessionId, registrationId } = useParams();
  const { isLoading, isError } = useRegistrationDetails(
    Number(examSessionId),
    Number(registrationId),
    PublicRegistrationFormStep.Done,
  );

  useEffect(() => {
    dispatch(setPublicFreeRegistration({ isFree: 'YES' }));
  }, [dispatch, examSessionId, registrationId]);

  return (
    <Box className="registration-payment-status-page">
      {isLoading ? (
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
