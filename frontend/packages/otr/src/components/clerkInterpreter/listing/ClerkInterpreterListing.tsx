import { Box } from '@mui/system';
import { useEffect } from 'react';
import { CustomCircularProgress, H2, PaginatedTable } from 'shared/components';
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

const HeaderTitle = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterListing.header',
  });

  return <H2>{t('title')}</H2>;
};

export const ClerkInterpreterListing = ({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) => {
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
          <H2>{t('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <PaginatedTable
          data={filteredInterpreters}
          header={<ClerkInterpreterListingHeader />}
          headerContent={<HeaderTitle />}
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
