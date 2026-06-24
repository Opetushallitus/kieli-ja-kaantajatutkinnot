import { Stack } from '@mui/material';

import { CustomerExamListings } from 'components/clerkCustomer/CustomerExamListings';
import { CustomerInformation } from 'components/clerkCustomer/CustomerInformation';
import { useAppSelector } from 'configs/redux';
import { RouteType } from 'interfaces/user';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';

export const ClerkCustomerDetails = ({ route }: { route: RouteType }) => {
  const { customerDetails } = useAppSelector(clerkCustomerDetailsSelector);

  return (
    <Stack rowGap={4}>
      <CustomerInformation route={route} person={customerDetails?.person} />
      <CustomerExamListings route={route} customerDetails={customerDetails} />
    </Stack>
  );
};
