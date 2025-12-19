import { Stack } from '@mui/material';

import { ClerkExamSessionDetails } from 'components/clerkExamSession/ClerkExamSessionDetails';
import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { useAppSelector } from 'configs/redux';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkExamSession = () => {
  const { clerkExamSession } = useAppSelector(clerkExamSessionDetailsSelector);

  if (!clerkExamSession) {
    return <></>;
  }

  return (
    <Stack rowGap={4}>
      <ClerkExamSessionDetails examSessionDetails={clerkExamSession} />
      <ClerkExamSessionRegistrations
        examRegistrations={clerkExamSession.registrations}
      />
    </Stack>
  );
};
