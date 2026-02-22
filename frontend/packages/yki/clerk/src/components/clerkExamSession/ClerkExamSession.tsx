import { Stack } from '@mui/material';
import { useEffect } from 'react';

import { ClerkExamSessionDetails } from 'components/clerkExamSession/ClerkExamSessionDetails';
import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetClerkExamSession } from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkExamSession = () => {
  const dispatch = useAppDispatch();
  const { clerkExamSession } = useAppSelector(clerkExamSessionDetailsSelector);

  useEffect(() => {
    return () => {
      dispatch(resetClerkExamSession());
    };
  }, [dispatch]);

  if (!clerkExamSession) {
    return <></>;
  }

  return (
    <Stack rowGap={4}>
      <ClerkExamSessionDetails
        examSessionDetails={clerkExamSession}
        languages={['deu', 'eng', 'fin']}
      />
      <ClerkExamSessionRegistrations
        examSessionId={clerkExamSession.id}
        examRegistrations={clerkExamSession.registrations}
      />
    </Stack>
  );
};
