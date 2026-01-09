import { Box } from '@mui/material';
import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2 } from 'ophTheme/Text';
import { loadCustomersSearch } from 'redux/reducers/clerkCustomersSearch';
import { clerkCustomersSearchSelector } from 'redux/selectors/clerkCustomersSearchSelector';

const InfoText = ({ status }: { status: APIResponseStatus }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.search',
  });

  return (
    <Box
      minHeight="10vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <H2>{t(`listing.apiResponseStatus.${status}`)}</H2>
    </Box>
  );
};

export const ClerkCustomerSearch = () => {
  const { status, customers, page, size, totalElements } = useAppSelector(
    clerkCustomersSearchSelector,
  );

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

  return (
    <>
      {status !== APIResponseStatus.Success ? (
        <InfoText status={status} />
      ) : (
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
      )}
    </>
  );
};
