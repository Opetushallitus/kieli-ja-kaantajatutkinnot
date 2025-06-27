import { Box } from '@mui/system';
import { useEffect } from 'react';
import {
  CustomCircularProgress,
  H2,
  PaginatedTable,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ClerkRegisterListingHeader } from 'components/clerkRegister/listing/ClerkRegisterListingHeader';
import { ClerkRegisterListingRow } from 'components/clerkRegister/listing/ClerkRegisterListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { loadClerkOrganizers } from 'redux/reducers/clerkOrganizer';
import {
  clerkOrganizersSelector,
  selectFilteredClerkOrganizers,
} from 'redux/selectors/clerkOrganizers';

const getRowDetails = (organizer: ClerkOrganizer) => {
  return <ClerkRegisterListingRow organizer={organizer} />;
};

const HeaderContent = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegisterListing.header',
  });

  return <Text>{t('searchResults')}</Text>;
};

export const ClerkRegisterListing = ({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) => {
  const { status } = useAppSelector(clerkOrganizersSelector);
  const filteredOrganizers = useAppSelector(selectFilteredClerkOrganizers);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizers());
    }
  }, [dispatch, status]);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegisterListing.header',
  });
  const translateCommon = useCommonTranslation();

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <CustomCircularProgress color={Color.Secondary} />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H2>{t('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <PaginatedTable
          data={filteredOrganizers}
          header={<ClerkRegisterListingHeader />}
          headerContent={<HeaderContent />}
          getRowDetails={getRowDetails}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
          className="table-layout-auto"
          controlledPaging={{ page, setPage }}
          stickyHeader
        />
      );
  }
};
