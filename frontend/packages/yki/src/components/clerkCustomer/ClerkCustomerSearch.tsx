import { useEffect } from 'react';

import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadCustomersSearch } from 'redux/reducers/clerkCustomersSearch';
import { clerkCustomersSearchSelector } from 'redux/selectors/clerkCustomersSearchSelector';

export const ClerkCustomerSearch = () => {
  const { customers } = useAppSelector(clerkCustomersSearchSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      loadCustomersSearch({
        request: {
          personQuery: '',
          organizerId: 0,
          examDateId: 0,
          languageCode: '',
          levelCode: '',
        },
        page: 0,
        size: 20,
      }),
    );
  }, [dispatch]);

  return (
    <>
      <ClerkCustomersListing />
      {JSON.stringify(customers)}
    </>
  );
};
