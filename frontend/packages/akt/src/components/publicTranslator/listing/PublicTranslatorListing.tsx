import { Box } from '@mui/system';
import {
  CustomCircularProgress,
  H2,
  H3,
  PaginatedTable,
} from 'shared/components';

import { PublicTranslatorListingHeader } from 'components/publicTranslator/listing/PublicTranslatorListingHeader';
import { PublicTranslatorListingRow } from 'components/publicTranslator/listing/PublicTranslatorListingRow';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Color } from 'enums/app';
import { PublicTranslator } from 'interfaces/publicTranslator';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';

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
  const { t } = useAppTranslation({ keyPrefix: 'akt' });
  const { selectedTranslators } = useAppSelector(publicTranslatorsSelector);
  const selected = selectedTranslators.length;

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
        <>
          <div className="columns">
            <div className="grow">
              <H2 data-testid="public-translators__selected-count-heading">
                {selected > 0
                  ? `${selected} ${t('component.table.selectedItems')}`
                  : t('component.table.title')}
              </H2>
            </div>
          </div>
          <PaginatedTable
            className="translator-listing"
            data={translators}
            header={<PublicTranslatorListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={10}
            rowsPerPageOptions={[10, 20, 50]}
            rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
            stickyHeader
          />
        </>
      );
  }
};
