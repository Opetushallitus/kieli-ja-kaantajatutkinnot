import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import {
  CustomCircularProgress,
  H2,
  H3,
  ManagedPaginatedTable,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicTranslatorListingHeader } from 'components/publicTranslator/listing/PublicTranslatorListingHeader';
import { PublicTranslatorListingRow } from 'components/publicTranslator/listing/PublicTranslatorListingRow';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicTranslator } from 'interfaces/publicTranslator';
import { setPage, setRowsPerPage } from 'redux/reducers/publicTranslator';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';

export const PublicTranslatorListing = ({
  status,
  translators,
}: {
  status: APIResponseStatus;
  translators: Array<PublicTranslator>;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'akr' });
  const { isPhone } = useWindowProperties();
  const { selectedTranslators, towns, pagination } = useAppSelector(
    publicTranslatorsSelector,
  );
  const dispatch = useAppDispatch();

  const selected = selectedTranslators.length;

  const townToSv = new Map(towns.map((t) => [t.name, t.nameSv]));
  const getRowDetails = (translator: PublicTranslator) => {
    return (
      <PublicTranslatorListingRow translator={translator} townToSv={townToSv} />
    );
  };

  const onPageChange = (page: number) => dispatch(setPage(page));

  const onRowsPerPageChange = (rowsPerPage: number) =>
    dispatch(setRowsPerPage(rowsPerPage));

  const listingHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isPhone) {
      listingHeaderRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, [isPhone]);

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
          <div className="columns" ref={listingHeaderRef}>
            <div className="grow">
              <H2 data-testid="public-translators__selected-count-heading">
                {selected > 0
                  ? `${selected} ${t('component.table.selectedItems')}`
                  : t('component.table.title')}
              </H2>
            </div>
          </div>
          <ManagedPaginatedTable
            className="public-translator-listing"
            data={translators}
            header={<PublicTranslatorListingHeader />}
            getRowDetails={getRowDetails}
            rowsPerPageOptions={[10, 20, 50]}
            page={pagination.page}
            onPageChange={onPageChange}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
            stickyHeader
          />
        </>
      );
  }
};
