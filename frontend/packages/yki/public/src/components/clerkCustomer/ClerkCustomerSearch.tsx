import { Box } from '@mui/material';
import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2 } from 'ophTheme/Text';
import { loadCustomersSearch } from 'redux/reducers/clerkCustomersSearch';
import { clerkCustomersSearchSelector } from 'redux/selectors/clerkCustomersSearchSelector';

export const ClerkCustomerSearch = () => {
  const { status, customers, page, size, totalElements } = useAppSelector(
    clerkCustomersSearchSelector,
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.search',
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(
        loadCustomersSearch({
          request: {
            personQuery: '',
          },
          page,
          size,
        }),
      );
    }
  }, [dispatch, page, size, status]);

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H2>{t('listing.apiResponseStatus.inProgress')}</H2>
        </Box>
      );
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H2>{t('listing.apiResponseStatus.error')}</H2>
        </Box>
      );

    case APIResponseStatus.Success:
      return (
        <>
          <ClerkCustomersListing
            customers={customers}
            page={page}
            pageSize={size}
            totalCount={totalElements}
            onPageChange={(newPage) =>
              dispatch(
                loadCustomersSearch({
                  request: {
                    personQuery: '',
                  },
                  page: newPage,
                  size,
                }),
              )
            }
          />
        </>
      );
  }
};
