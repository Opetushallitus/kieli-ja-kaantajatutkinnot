import { Box } from '@mui/system';
import { CustomCircularProgress, H3, PaginatedTable } from 'shared/components';
import { Color } from 'shared/enums';

import { PublicTranslatorListingHeader } from 'components/publicTranslator/listing/PublicTranslatorListingHeader';
import { PublicTranslatorListingRow } from 'components/publicTranslator/listing/PublicTranslatorListingRow';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { APIResponseStatus } from 'enums/api';
import { PublicTranslator } from 'interfaces/publicTranslator';

const getRowDetails = (translator: PublicTranslator) => {
  return <PublicTranslatorListingRow translator={translator} />;
};

export const PublicTranslatorListing = ({
  status,
  translators,
}: {
  status: APIResponseStatus;
  translators: Array<PublicTranslator>;
}) => {
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
          className="translator-listing"
          data={translators}
          header={<PublicTranslatorListingHeader />}
          getRowDetails={getRowDetails}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          rowsPerPageLabel={translateCommon('otr.common.rowsPerPage')}
          stickyHeader
        />
      );
  }
};
