import { Stack } from '@mui/material';

import { CustomerExamListings } from 'components/clerkCustomer/CustomerExamListings';
import { CustomerInformation } from 'components/clerkCustomer/CustomerInformation';
import { useAppSelector } from 'configs/redux';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';

export const ClerkCustomerDetails = () => {
  const { customerDetails } = useAppSelector(clerkCustomerDetailsSelector);

  return (
    <Stack rowGap={4}>
      <CustomerInformation person={customerDetails?.person} />
      <CustomerExamListings customerDetails={customerDetails} />
    </Stack>
  );
};
