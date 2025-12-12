import { Stack } from '@mui/material';

import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { ClerkExamSessionDetails } from 'components/clerkExamSession/CustomerExamSessionDetails';
import { useAppSelector } from 'configs/redux';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkExamSession = () => {
  const { examSessionDetails } = useAppSelector(clerkCustomerDetailsSelector);

  return (
    <Stack rowGap={4}>
      <ClerkExamSessionDetails examSessionDetails={examSessionDetails} />
      <ClerkExamSessionRegistrations registrations={examSessionDetails.registrations} />
    </Stack>
  );
};
