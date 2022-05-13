import { Box } from '@mui/system';
import { CustomCircularProgress, H3, PaginatedTable } from 'shared/components';
import { Color } from 'shared/enums';

import { PublicInterpreterListingHeader } from 'components/publicInterpreter/listing/PublicInterpreterListingHeader';
import { PublicInterpreterListingRow } from 'components/publicInterpreter/listing/PublicInterpreterListingRow';
import { useAppTranslation } from 'configs/i18n';
import { APIResponseStatus } from 'enums/api';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

const getRowDetails = (interpreter: PublicInterpreter) => {
  return <PublicInterpreterListingRow interpreter={interpreter} />;
};

export const PublicInterpreterListing = ({
  status,
  interpreters,
}: {
  status: APIResponseStatus;
  interpreters: Array<PublicInterpreter>;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'otr' });

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
          className="interpreter-listing"
          data={interpreters}
          header={<PublicInterpreterListingHeader />}
          getRowDetails={getRowDetails}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          rowsPerPageLabel={t(
            'component.publicInterpreterListing.rowsPerPageLabel'
          )}
          stickyHeader
        />
      );
  }
};
