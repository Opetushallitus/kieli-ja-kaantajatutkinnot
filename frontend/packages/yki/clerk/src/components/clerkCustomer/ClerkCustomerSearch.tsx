import { Box } from '@mui/material';
import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { ClerkCustomerListingFilter } from 'components/clerkCustomer/ClerkCustomerListingFilter';
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
  const {
    status,
    customers,
    searchQueryFilter,
    organizerIdFilter,
    examSessionIdFilter,
    languageCodeFilter,
    levelCodeFilter,
    page,
    size,
    totalElements,
  } = useAppSelector(clerkCustomersSearchSelector);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(
        loadCustomersSearch({
          request: {
            personQuery: searchQueryFilter,
            organizerId: organizerIdFilter,
            examSessionId: examSessionIdFilter,
            languageCode: languageCodeFilter,
            levelCode: levelCodeFilter,
          },
          page,
          size,
        }),
      );
    }
  }, [
    dispatch,
    examSessionIdFilter,
    languageCodeFilter,
    levelCodeFilter,
    organizerIdFilter,
    page,
    searchQueryFilter,
    size,
    status,
  ]);

  return (
    <>
      <ClerkCustomerListingFilter />

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
                  personQuery: searchQueryFilter,
                  organizerId: organizerIdFilter,
                  examSessionId: examSessionIdFilter,
                  languageCode: languageCodeFilter,
                  levelCode: levelCodeFilter,
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
