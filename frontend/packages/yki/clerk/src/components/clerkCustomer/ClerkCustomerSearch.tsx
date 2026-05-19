import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { APIResponseStatus } from 'shared/enums';

import { ClerkCustomerListingFilter } from 'components/clerkCustomer/ClerkCustomerListingFilter';
import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RouteType } from 'interfaces/user';
import { H2 } from 'ophTheme/Text';
import {
  loadCustomersSearch,
  loadOrganizerCustomersSearch,
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

export const ClerkCustomerSearch = ({ route }: { route: RouteType }) => {
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
  } = useAppSelector(clerkCustomersSearchSelector);

  const dispatch = useAppDispatch();
  const params = useParams();
  const oid = params.oid ?? '';

  const loadSearch = (page: number) => {
    dispatch(
      route === 'clerk'
        ? loadCustomersSearch({
            request: {
              personQuery: searchQueryFilter,
              organizerId: organizerIdFilter,
              examDateId: examDateIdFilter,
              languageCode: languageCodeFilter,
              levelCode: levelCodeFilter,
            },
            page: page,
            size,
          })
        : loadOrganizerCustomersSearch({
            request: {
              personQuery: searchQueryFilter,
              examDateId: examDateIdFilter,
              languageCode: languageCodeFilter,
              levelCode: levelCodeFilter,
            },
            page: page,
            size,
            oid,
          }),
    );
  };

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
            route={route}
            oid={oid}
            onPageChange={(newPage) => loadSearch(newPage)}
          />
        );
      default:
        return <InfoText status={status} />;
    }
  };

  return (
    <>
      <ClerkCustomerListingFilter
        loadSearch={loadSearch}
        route={route}
        oid={oid}
      />
      {renderClerkCustomersListing()}
    </>
  );
};
