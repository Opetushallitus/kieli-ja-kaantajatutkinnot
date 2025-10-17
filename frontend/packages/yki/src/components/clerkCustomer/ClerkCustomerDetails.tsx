import { CustomerExamListings } from 'components/clerkCustomer/CustomerExamListings';
import { CustomerInformation } from 'components/clerkCustomer/CustomerInformation';
import { useAppSelector } from 'configs/redux';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';

export const ClerkCustomerDetails = () => {
  const { customerDetails } = useAppSelector(clerkCustomerDetailsSelector);

  return (
    <>
      <CustomerInformation person={customerDetails?.person} />
      <CustomerExamListings customerDetails={customerDetails} />
    </>
  );
};
