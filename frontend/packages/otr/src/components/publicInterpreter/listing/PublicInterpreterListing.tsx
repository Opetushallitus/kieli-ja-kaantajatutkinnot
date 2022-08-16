import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import {
  CustomCircularProgress,
  H2,
  H3,
  PaginatedTable,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicInterpreterListingHeader } from 'components/publicInterpreter/listing/PublicInterpreterListingHeader';
import { PublicInterpreterListingRow } from 'components/publicInterpreter/listing/PublicInterpreterListingRow';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
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
  const { isPhone } = useWindowProperties();
  const listingHeaderRef = useRef<HTMLDivElement>(null);
  const translateCommon = useCommonTranslation();

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
              <H2>{translateCommon('searchResults')}</H2>
              <Text className="margin-top-sm">
                {t('component.publicInterpreterListing.searchResultsInfo')}
              </Text>
            </div>
          </div>
          <PaginatedTable
            className="public-interpreter-listing"
            data={interpreters}
            header={<PublicInterpreterListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={10}
            rowsPerPageOptions={[10, 20, 50]}
            rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
            stickyHeader
          />
        </>
      );
  }
};
