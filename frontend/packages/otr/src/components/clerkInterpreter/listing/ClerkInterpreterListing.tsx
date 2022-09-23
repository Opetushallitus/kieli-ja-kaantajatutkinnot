import { Box } from '@mui/system';
import { useEffect } from 'react';
import { CustomCircularProgress, H3, PaginatedTable } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ClerkInterpreterListingHeader } from 'components/clerkInterpreter/listing/ClerkInterpreterListingHeader';
import { ClerkInterpreterListingRow } from 'components/clerkInterpreter/listing/ClerkInterpreterListingRow';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { loadClerkInterpreters } from 'redux/reducers/clerkInterpreter';
import {
  clerkInterpretersSelector,
  selectFilteredClerkInterpreters,
} from 'redux/selectors/clerkInterpreter';

const getRowDetails = (interpreter: ClerkInterpreter) => {
  return <ClerkInterpreterListingRow interpreter={interpreter} />;
};

export const ClerkInterpreterListing = () => {
  const { status } = useAppSelector(clerkInterpretersSelector);
  const filteredInterpreters = useAppSelector(selectFilteredClerkInterpreters);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkInterpreters());
    }
  }, [dispatch, status]);
  const { t } = useAppTranslation({ keyPrefix: 'otr' });
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
          <H3>{t('errors.loadingFailed')}</H3>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <PaginatedTable
          data={filteredInterpreters}
          header={<ClerkInterpreterListingHeader />}
          headerTitle={t('component.clerkInterpreterListing.header.title')}
          getRowDetails={getRowDetails}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
          className={'clerk-interpreter__listing table-layout-auto'}
          stickyHeader
        />
      );
  }
};
