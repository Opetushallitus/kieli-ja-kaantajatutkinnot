import { SelectChangeEvent } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import { CustomCircularProgress, H2, PaginatedTable } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { LanguageFilter } from 'components/publicExamEvent/LanguageFilter';
import { PublicExamEventListingHeader } from 'components/publicExamEvent/listing/PublicExamEventListingHeader';
import { PublicExamEventListingRow } from 'components/publicExamEvent/listing/PublicExamEventListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { setPublicExamEventLanguageFilter } from 'redux/reducers/publicExamEvent';
import {
  publicExamEventsSelector,
  selectFilteredPublicExamEvents,
} from 'redux/selectors/publicExamEvent';

const getRowDetails = (examEvent: PublicExamEvent) => {
  return <PublicExamEventListingRow examEvent={examEvent} />;
};

export const PublicExamEventListing = ({
  status,
}: {
  status: APIResponseStatus;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const { isPhone } = useWindowProperties();
  const listingHeaderRef = useRef<HTMLDivElement>(null);

  const { languageFilter } = useAppSelector(publicExamEventsSelector);
  const filteredExamEvents = useAppSelector(selectFilteredPublicExamEvents);

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setPublicExamEventLanguageFilter(event.target.value as ExamLanguage),
    );
  };

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
          <H2>{translateCommon('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div
            className="public-exam-event-heading columns"
            ref={listingHeaderRef}
          >
            <div className="grow">
              <H2>{t('title')}</H2>
            </div>
          </div>
          <PaginatedTable
            headerContent={
              <LanguageFilter
                value={languageFilter}
                onChange={handleLanguageFilterChange}
              />
            }
            className="table-layout-auto"
            data={filteredExamEvents}
            header={<PublicExamEventListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={20}
            rowsPerPageOptions={[20, 50]}
            rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
            stickyHeader
          />
        </>
      );
  }
};
