import { Box } from '@mui/material';
import { APIResponseStatus } from 'shared/enums';

import { ClerkCustomerListingFilter } from 'components/clerkCustomer/ClerkCustomerListingFilter';
import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2 } from 'ophTheme/Text';
import {
  loadCustomersSearch,
  setCustomersSort,
} from 'redux/reducers/clerkCustomersSearch';
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
    examDateIdFilter,
    languageCodeFilter,
    levelCodeFilter,
    page,
    size,
    totalElements,
    sort,
  } = useAppSelector(clerkCustomersSearchSelector);

  const dispatch = useAppDispatch();

  const renderClerkCustomersListing = () => {
    switch (status) {
      case APIResponseStatus.NotStarted:
        return null;
      case APIResponseStatus.Success:
        return (
          <ClerkCustomersListing
            customers={customers}
            page={page}
            pageSize={size}
            totalCount={totalElements}
            sort={sort}
            onSortChange={(newSort) => {
              dispatch(setCustomersSort(newSort));
              dispatch(
                loadCustomersSearch({
                  request: {
                    personQuery: searchQueryFilter,
                    organizerId: organizerIdFilter,
                    examDateId: examDateIdFilter,
                    languageCode: languageCodeFilter,
                    levelCode: levelCodeFilter,
                  },
                  page: 0,
                  size,
                  sort: newSort,
                }),
              );
            }}
            onPageChange={(newPage) =>
              dispatch(
                loadCustomersSearch({
                  request: {
                    personQuery: searchQueryFilter,
                    organizerId: organizerIdFilter,
                    examDateId: examDateIdFilter,
                    languageCode: languageCodeFilter,
                    levelCode: levelCodeFilter,
                  },
                  page: newPage,
                  size,
                  sort,
                }),
              )
            }
          />
        );
      default:
        return <InfoText status={status} />;
    }
  };

  return (
    <>
      <ClerkCustomerListingFilter />
      {renderClerkCustomersListing()}
    </>
  );
};
